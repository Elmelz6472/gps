import React, { useEffect, useRef, useState } from 'react'
import { useMapContext } from '../../Contexts/MapContext'
import styles from './DirectionPanel.module.css'
import Draggable from 'react-draggable'
import { useCustomPlacesAutocomplete } from '../../utils/Hooks/PlacesAutoCompleteHook'
import convertCoordinatesToAddress from '../../utils/CoordToName'
import { getGeocode, getLatLng } from 'use-places-autocomplete'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import useOnclickOutside from 'react-cool-onclickoutside'
import SettingsPanel from '../SettingsPanel/SettingsPanel'
import getLocalStorageItem from '../../utils/retrieveLocalStorageItem'
import QuestionsPanel from '../QuestionsPanel/QuestionsPanel'

import {
    faCar,
    faBus,
    faWalking,
    faCompass,
    faMapMarkedAlt,
    faCog,
} from '@fortawesome/free-solid-svg-icons'

import { useSettingsContext } from '../../Contexts/SettingsContext'
import { useDirectionContext } from '../../Contexts/DirectionContext'

const DirectionPanel: React.FC = () => {
    const {
        center,
        setCenter,
        destination,
        destinationName,
        setDestination,
        setDestinationName,
        setDepartureAddressName,
        setDepartureAddress,
        departureAddressName,
        departureAddress,
        selectedIcons,
        setSelectedIcons,
        setIsFocused,
        isFocused,
    } = useMapContext()

    const { isComparaisonPanel, setIsComparaisonPanel } = useDirectionContext()

    const [isLoading, setIsLoading] = useState(false)
    const { isSettingsVisible, setIsSettingsVisible } = useSettingsContext()

    const handleLocateUser = () => {
        setIsLoading(true) // Set loading state to true while fetching location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const newPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }

                    const nameAddressUser = await convertCoordinatesToAddress(
                        newPosition
                    )
                    setCenter(newPosition)
                    setDepartureAddress(newPosition)
                    setDepartureAddressName(nameAddressUser)
                    console.log('New Departure Address:', newPosition)
                    setIsFocused(false)
                    setIsLoading(false) // Set loading state to false after fetching location
                },
                () => {
                    console.log('Geolocation permission denied or unavailable.')
                    setIsLoading(false) // Set loading state to false if geolocation fails
                }
            )
        } else {
            console.log('Geolocation is not supported by your browser.')
            setIsLoading(false) // Set loading state to false if geolocation is not supported
        }
    }

    const [isDismissed, setIsDismissed] = useState(false)
    const handleDismiss = () => {
        setIsDismissed(true)
    }
    const handleExpand = () => {
        setIsDismissed(false)
    }

    const nodeRef = React.useRef(null)

    const [selectedTransportationMode, setSelectedTransportationMode] =
        useState<string | null>(null)

    const [showQuestionsPanel, setShowQuestionsPanel] = useState(false)

    const handleQuestionsPanelClose = (selectedPriority: string | null) => {
        console.log('User selected priority:', selectedPriority)
        // setShowQuestionsPanel(false)
    }

    const {
        ready: departureReady,
        value: departureValue,
        setValue: setDepartureValue,
        suggestions: { status: departureStatus, data: departureData },
        clearSuggestions: clearDepartureSuggestions,
    } = useCustomPlacesAutocomplete()

    const {
        ready: arrivalReady,
        value: arrivalValue,
        setValue: setArrivalValue,
        suggestions: { status: arrivalStatus, data: arrivalData },
        clearSuggestions: clearArrivalSuggestions,
    } = useCustomPlacesAutocomplete()

    const handleSelectDeparture = async (address: string) => {
        setDepartureValue(address, false)
        setDepartureAddressName(address)
        clearDepartureSuggestions()

        const results = await getGeocode({ address: address })
        const { lat, lng } = await getLatLng(results[0])
        setDepartureAddress({ lat, lng })
        setCenter({ lat, lng })
    }

    const handleSelectArrival = async (address: string) => {
        console.log('clickeddd')
        setArrivalValue(address, false)
        setDestinationName(address)
        clearArrivalSuggestions()

        const results = await getGeocode({ address: address })
        const { lat, lng } = await getLatLng(results[0])
        setDestination({ lat, lng })
        setCenter({ lat, lng })
    }

    const handleKeyDownDeparture = (e: {
        key: string
        preventDefault: () => void
    }) => {
        if (e.key === 'Tab') {
            console.log('tab')
            e.preventDefault()
            setDepartureValue(departureAddressName as string)
            setDepartureAddressName(departureAddressName as string)
        }
    }

    const handleKeyDownArrival = (e: {
        key: string
        preventDefault: () => void
    }) => {
        if (e.key === 'Tab') {
            console.log('tab')
            e.preventDefault()
            setArrivalValue(destinationName as string)
            setDestinationName(destinationName as string)
        }
    }

    const handleIconClick = (icon: IconDefinition) => {
        if (
            selectedIcons.some(
                (selectedIcon: { iconName: string }) =>
                    selectedIcon.iconName === icon.iconName
            )
        ) {
            setSelectedIcons(
                selectedIcons.filter(
                    (selectedIcon: { iconName: string }) =>
                        selectedIcon.iconName !== icon.iconName
                )
            )
        } else {
            setSelectedIcons([
                ...selectedIcons,
                { ...icon, iconName: icon.iconName },
            ])
        }
    }

    const refDeparture = useOnclickOutside(() => {
        clearDepartureSuggestions()
    })

    const refArrival = useOnclickOutside(() => {
        clearArrivalSuggestions()
    })

    useEffect(() => {
        setArrivalValue(destinationName as string)
    }, [destinationName, setArrivalValue])

    useEffect(() => {
        setDepartureValue(departureAddressName as string)
    }, [departureAddressName, setDepartureValue])

    const swapInfo = () => {
        setIsFocused(false)
        const tempDepartureData = {
            address: departureAddress,
            addressName: departureAddressName,
            addressValue: departureValue,
        }
        const tempArrivalData = {
            address: destination,
            addressName: destinationName,
            addressValue: arrivalValue,
        }
        setDepartureAddress(tempArrivalData.address)
        setDepartureAddressName(tempArrivalData.addressName)

        setDestination(tempDepartureData.address)
        setDestinationName(tempDepartureData.addressName)
    }

    const [hasChangedDeparture, setHasChangedDeparture] = useState(false)
    const [hasChangedArrival, setHasChangedArrival] = useState(false)

    const handleShowQuestionsPanel = () => {
        setShowQuestionsPanel(true)
    }

    return (
        <>
            <Draggable nodeRef={nodeRef}>
                <div
                    ref={nodeRef}
                    className={`${styles.panel} ${
                        isDismissed ? styles.dismissed : ''
                    } ${isDismissed ? '' : styles.expanded}`}
                >
                    {!isDismissed && (
                        <>
                            <div className={styles.groupTop}>
                                <button
                                    className={styles.button}
                                    onClick={() =>
                                        setIsSettingsVisible(!isSettingsVisible)
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faCog}
                                        className={styles.icon}
                                    />
                                </button>

                                <div
                                    className={`${styles.groupIcons} ${
                                        selectedIcons.length === 2
                                            ? styles.selectedContainer
                                            : ''
                                    }`}
                                >
                                    <button
                                        className={`${styles.iconButton} ${
                                            selectedIcons.includes(faBus)
                                                ? styles.selectedIcon
                                                : ''
                                        }`}
                                        onClick={() => handleIconClick(faBus)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faBus}
                                            className={`${styles.icon} ${
                                                selectedIcons.includes(faBus)
                                                    ? styles.selectedIcon
                                                    : ''
                                            }`}
                                        />
                                    </button>
                                    <button
                                        className={`${styles.iconButton} ${
                                            selectedIcons.includes(faCar)
                                                ? styles.selectedIcon
                                                : ''
                                        }`}
                                        onClick={() => handleIconClick(faCar)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faCar}
                                            className={`${styles.icon} ${
                                                selectedIcons.includes(faCar)
                                                    ? styles.selectedIcon
                                                    : ''
                                            }`}
                                        />
                                    </button>
                                </div>

                                <button
                                    className={`${styles.button} ${styles.dismissButton}`}
                                    onClick={handleDismiss}
                                >
                                    &#8230;
                                </button>
                            </div>

                            <div className={styles.inputContainer}>
                                <div
                                    className={styles.searchFormContainer}
                                    ref={refDeparture}
                                >
                                    <input
                                        type="text"
                                        placeholder={
                                            hasChangedDeparture
                                                ? departureAddressName
                                                    ? departureAddressName.toString()
                                                    : 'Enter a departure'
                                                : localStorage.getItem(
                                                      'homeAddress'
                                                  ) || ''
                                        }
                                        className={styles.input}
                                        value={departureValue || ''}
                                        onChange={(e) => {
                                            setDepartureValue(e.target.value)
                                            setDepartureAddressName(
                                                e.target.value
                                            )
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Tab') {
                                                e.preventDefault()
                                                console.log('Tab')
                                                setDepartureValue(
                                                    localStorage.getItem(
                                                        'homeAddress'
                                                    ) || ''
                                                )
                                            }
                                            setIsFocused(true)
                                        }}
                                        disabled={!departureReady}
                                    />
                                    {departureStatus === 'OK' && isFocused && (
                                        <ul
                                            className={
                                                styles.suggestionContainer
                                            }
                                        >
                                            {departureData.map(
                                                ({ place_id, description }) => (
                                                    <li
                                                        key={place_id}
                                                        className={
                                                            styles.suggestionItem
                                                        }
                                                        onClick={() => {
                                                            handleSelectDeparture(
                                                                description
                                                            )
                                                            setIsFocused(false)
                                                        }}
                                                    >
                                                        {description}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <div
                                    className={styles.searchFormContainer}
                                    ref={refArrival}
                                >
                                    <input
                                        type="text"
                                        placeholder={
                                            hasChangedArrival
                                                ? destinationName
                                                    ? destinationName.toString()
                                                    : 'Enter an arrival'
                                                : localStorage.getItem(
                                                      'favoriteDestination'
                                                  ) || ''
                                        }
                                        className={styles.input}
                                        value={arrivalValue || ''}
                                        onChange={(e) => {
                                            setArrivalValue(e.target.value)
                                            setDestinationName(e.target.value)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Tab') {
                                                e.preventDefault()
                                                console.log('Tab')
                                                setArrivalValue(
                                                    localStorage.getItem(
                                                        'favoriteDestination'
                                                    ) || ''
                                                )
                                            }
                                            setIsFocused(true)
                                        }}
                                        disabled={!arrivalReady}
                                    />
                                    {arrivalStatus === 'OK' && isFocused && (
                                        <ul
                                            className={
                                                styles.suggestionContainer
                                            }
                                        >
                                            {arrivalData.map(
                                                ({ place_id, description }) => (
                                                    <li
                                                        key={place_id}
                                                        className={
                                                            styles.suggestionItem
                                                        }
                                                        onClick={() => {
                                                            handleSelectArrival(
                                                                description
                                                            )
                                                            console.log(
                                                                'clicked'
                                                            )
                                                            setIsFocused(false)
                                                        }}
                                                    >
                                                        {description}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <button
                                    className={`${styles.button} ${styles.swapButton}`}
                                    onClick={swapInfo}
                                >
                                    &#8593;&#8595;
                                </button>
                            </div>

                            <button
                                className={`${styles.button} ${styles.getUserLocation}`}
                                onClick={handleLocateUser}
                                disabled={isLoading} // Disable button while loading
                            >
                                {isLoading ? ( // Conditionally render loading icon or compass icon
                                    <FontAwesomeIcon
                                        icon="spinner"
                                        spin
                                        className={styles.icon}
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faCompass}
                                        className={styles.icon}
                                    />
                                )}
                                {isLoading
                                    ? 'Getting Location...'
                                    : 'Use My Location'}
                                {/* Change button text based on loading state */}
                            </button>

                            <button
                                className={`${styles.button} ${styles.setCourseButton}`}
                                onClick={() => {
                                    // setShowQuestionsPanel(true)
                                    setIsComparaisonPanel(true)
                                    console.log('clickeddd')
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faMapMarkedAlt}
                                    className={styles.icon}
                                />
                                Choose the best way to your destination
                            </button>
                            {showQuestionsPanel && (
                                <QuestionsPanel
                                    onClose={handleQuestionsPanelClose}
                                    selectedTransportationMode={
                                        selectedTransportationMode
                                    }
                                />
                            )}
                        </>
                    )}
                    {isDismissed && (
                        <button
                            className={`${styles.button} ${styles.expandButton}`}
                            onClick={handleExpand}
                        >
                            <FontAwesomeIcon
                                icon={faMapMarkedAlt}
                                className={styles.icon}
                            />
                        </button>
                    )}
                </div>
            </Draggable>

            {isSettingsVisible && <SettingsPanel />}
            {/* <SettingsPanel /> */}
        </>
    )
}

export default DirectionPanel
