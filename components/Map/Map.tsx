// components/Map/Map.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'
import { useMapContext } from '../../Contexts/MapContext'
import styles from './Map.module.css'
import { MapOptions } from '../../types'
import GoogleMapIds from '../../googleMapIds.json'
import convertCoordinatesToAddress from '../../utils/CoordToName'

const containerStyle = {
    width: '100vw',
    height: '100vh',
}

const Map: React.FC = () => {
    const {
        center,
        destination,
        setDestination,
        setDestinationName,
        departureAddress,
        departureAddressName,
        setDepartureAddress,
        setDepartureAddressName,
        directions,
    } = useMapContext()

    const mapRef = useRef<google.maps.Map | null>(null)

    const handleMapClick = async (e: google.maps.MapMouseEvent) => {
        const clickedLatlng = e.latLng?.toJSON() // Convert to LatLngLiteral
        if (clickedLatlng) {
            const namedAdress = await convertCoordinatesToAddress(
                e.latLng?.toJSON() as google.maps.LatLngLiteral
            )
            setDestination(clickedLatlng)
            setDestinationName(namedAdress)

            mapRef.current?.panTo(clickedLatlng)
        }
    }

    const options = useMemo<MapOptions>(
        () => ({
            mapId: GoogleMapIds['darkMode'],
            disableDefaultUI: true,
            clickableIcons: false,
        }),
        []
    )

    const onLoad = (mapInstance: google.maps.Map) => {
        mapRef.current = mapInstance
    }

    const polylineRef = useRef<google.maps.Polyline | null>(null)

    useEffect(() => {
        if (polylineRef.current) {
            polylineRef.current.setMap(null)
        }
        if (directions) {
            const line = new google.maps.Polyline({
                path: directions.overview_path,
                strokeColor: 'black',
                strokeOpacity: 1.1,
                strokeWeight: 3,
            })

            line.setMap(mapRef.current)
            polylineRef.current = line
        }
    }, [directions])

    useEffect(() => {
        if (polylineRef.current) {
            polylineRef.current.setMap(null)
        }
    }, [destination, departureAddress, departureAddressName])

    // useEffect(() => {
    //     if (destination) {
    //         mapRef.current?.panTo(destination)
    //     }
    // }, [destination])

    return (
        <div className={styles.mapContainer}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onClick={handleMapClick}
                onLoad={onLoad}
                options={options}
            >
                {departureAddress && departureAddressName && (
                    <Marker
                        position={departureAddress}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 15,
                            fillColor: 'red',
                            fillOpacity: 1,
                            strokeColor: 'white',
                            strokeWeight: 2,
                        }}
                    />
                )}
                {destination && <Marker position={destination} />}
                {directions && <div>{directions.toString()}</div>}
            </GoogleMap>
        </div>
    )
}

export default React.memo(Map)
