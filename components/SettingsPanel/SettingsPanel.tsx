import React, { useState, useEffect } from 'react'
import { fetchData, AjaxOptions } from '../../utils/ajaxUtils'
import styles from './SettingsPanel.module.css'

import { useSettingsContext } from '../../Contexts/SettingsContext'
import { useCustomPlacesAutocomplete } from '../../utils/Hooks/PlacesAutoCompleteHook'
import { useMapContext } from '../../Contexts/MapContext'
import useOnclickOutside from 'react-cool-onclickoutside'
import Draggable from 'react-draggable'

interface CarInfo {
    model: string
    year: number
    make: string
    fuel_type: string
    combination_mpg: number
}

const defaultCarInfo: CarInfo = {
    model: 'n.a',
    year: NaN,
    make: 'n.a',
    fuel_type: 'normal',
    combination_mpg: 17,
}

const SettingsPanel: React.FC = () => {
    const [favoriteCar, setFavoriteCar] = useState<string>('')
    const [homeAddress, setHomeAddress] = useState<string>('')
    const [favoriteAddress, setFavoriteAddress] = useState<string>('')
    const [publicTransportInfo, setPublicTransportInfo] = useState<string>('')

    useEffect(() => {
        setFavoriteCar(localStorage.getItem('favoriteCar') || '')
        setHomeAddress(localStorage.getItem('homeAddress') || '')
        setFavoriteAddress(localStorage.getItem('favoriteDestination') || '')
        setPublicTransportInfo(
            localStorage.getItem('publicTransportInfo') || ''
        )
    }, [])

    const { setIsSettingsVisible, setCarInfoUser } = useSettingsContext()

    const {
        defaultDepartureAdressName,
        setDefaultDepartureAdressName,
        defaultArrivalAdressName,
        setDefaultArrivalAdressName,
    } = useMapContext()

    useEffect(() => {
        setHomeAddress(defaultDepartureAdressName as string)
    }, [
        setHomeAddress,
        defaultDepartureAdressName,
        setDefaultDepartureAdressName,
    ])

    useEffect(() => {
        setFavoriteAddress(defaultArrivalAdressName as string)
    }, [
        setFavoriteAddress,
        defaultArrivalAdressName,
        setDefaultArrivalAdressName,
    ])

    const {
        ready: defaultDepartureReady,
        value: defaultDepartureValue,
        setValue: setDefaultDepartureValue,
        suggestions: {
            status: defaultDepartureStatus,
            data: defaultDepartureData,
        },
        clearSuggestions: defaultClearDepartureSuggestions,
    } = useCustomPlacesAutocomplete()

    const {
        ready: defaultArrivalReady,
        value: defaultArrivalValue,
        setValue: setDefaultArrivalValue,
        suggestions: { status: defaultArrivalStatus, data: defaultArrivalData },
        clearSuggestions: defaultClearArrivalSuggestions,
    } = useCustomPlacesAutocomplete()

    const refDefaultDeparture = useOnclickOutside(() => {
        defaultClearDepartureSuggestions()
    })

    const [hasChangedDeparture, setHasChangedDeparture] = useState(false)
    const [hasChangedArrival, setHasChangedArrival] = useState(false)

    const clearLocalStorage = () => {
        localStorage.removeItem('favoriteCar')
        localStorage.removeItem('homeAddress')
        localStorage.removeItem('favoriteDestination')
        localStorage.removeItem('publicTransportInfo')

        // Clear state as well
        setFavoriteCar('')
        setHomeAddress('')
        setFavoriteAddress('')
        setPublicTransportInfo('')
    }

    const nodeRef = React.useRef(null)

    return (
        <Draggable nodeRef={nodeRef}>
            <div ref={nodeRef} className={styles.SettingsPanel}>
                <h2>Settings</h2>

                <label>
                    Favorite Car:
                    <input
                        type="text"
                        onChange={(e) => {
                            setFavoriteCar(e.target.value)
                        }}
                        placeholder={localStorage.getItem('favoriteCar') || ''}
                    />
                </label>

                <label>
                    Home Address:
                    <div
                        className={styles.searchFormContainer}
                        ref={refDefaultDeparture}
                    >
                        <input
                            type="text"
                            placeholder={'Enter a default place'}
                            className={styles.input}
                            value={
                                hasChangedDeparture
                                    ? defaultDepartureAdressName || ''
                                    : localStorage.getItem('homeAddress') ||
                                      defaultDepartureAdressName ||
                                      ''
                            }
                            onChange={(e) => {
                                setDefaultDepartureValue(e.target.value)
                                setDefaultDepartureAdressName(e.target.value)
                                setHasChangedDeparture(true)
                            }}
                            disabled={!defaultDepartureReady}
                        />
                        {defaultDepartureStatus === 'OK' && (
                            <ul className={styles.suggestionContainer}>
                                {defaultDepartureData.map(
                                    ({ place_id, description }) => (
                                        <li
                                            key={place_id}
                                            className={styles.suggestionItem}
                                            onClick={() => {
                                                setDefaultDepartureAdressName(
                                                    description
                                                )
                                                setDefaultDepartureValue(
                                                    description,
                                                    false
                                                )
                                                defaultClearDepartureSuggestions()
                                            }}
                                        >
                                            {description}
                                        </li>
                                    )
                                )}
                            </ul>
                        )}
                    </div>
                </label>

                <label>
                    Favorite Destination:
                    <input
                        type="text"
                        placeholder={'Enter a default arrival place'}
                        className={styles.input}
                        value={
                            hasChangedArrival
                                ? defaultArrivalAdressName || ''
                                : localStorage.getItem('favoriteDestination') ||
                                  defaultArrivalAdressName ||
                                  ''
                        }
                        onChange={(e) => {
                            setDefaultArrivalValue(e.target.value)
                            setDefaultArrivalAdressName(e.target.value)
                            setHasChangedArrival(true)
                        }}
                        disabled={!defaultArrivalReady}
                    />
                    {defaultArrivalStatus === 'OK' && (
                        <ul className={styles.suggestionContainer}>
                            {defaultArrivalData.map(
                                ({ place_id, description }) => (
                                    <li
                                        key={place_id}
                                        className={styles.suggestionItem}
                                        onClick={() => {
                                            setDefaultArrivalAdressName(
                                                description
                                            )
                                            setDefaultArrivalValue(
                                                description,
                                                false
                                            )
                                            defaultClearArrivalSuggestions()
                                        }}
                                    >
                                        {description}
                                    </li>
                                )
                            )}
                        </ul>
                    )}
                </label>

                <button
                    onClick={async () => {
                        console.log('click save')

                        localStorage.setItem('homeAddress', homeAddress)
                        localStorage.setItem(
                            'favoriteDestination',
                            favoriteAddress
                        )
                        localStorage.setItem('publicTransportInfo', '')

                        // Fetch data using AJAX
                        const model = favoriteCar || '' // Change this to get the actual value
                        console.log(model)
                        if (model != '') {
                            const endpoint = `https://api.api-ninjas.com/v1/cars?limit=2&model=${model}`
                            const options: AjaxOptions = {
                                method: 'GET',
                                headers: {
                                    'X-Api-Key':
                                        'UVY95MwCMh2OJxPXL165Fg==rfaA4tZTB7wIc4jq',
                                    'Content-Type': 'application/json',
                                },
                            }

                            const result = await fetchData<any>(
                                endpoint,
                                options
                            )
                            console.log(
                                'the results of the car: ' +
                                    JSON.stringify(result)
                            )

                            if (!result) {
                                setCarInfoUser(defaultCarInfo)
                            } else {
                                setCarInfoUser(result[0])
                                localStorage.setItem('favoriteCar', favoriteCar)
                            }
                        }
                        setIsSettingsVisible(false)
                    }}
                >
                    Save
                </button>
                <button onClick={clearLocalStorage}>Clear Info</button>
            </div>
        </Draggable>
    )
}

export default SettingsPanel
