// components/DebugComponent/DebugComponent.tsx
import React from 'react'
import { useMapContext } from '../../Contexts/MapContext'
import styles from './DebugComponent.module.css'
import { useDirectionContext } from '../../Contexts/DirectionContext'
import { useSettingsContext } from '../../Contexts/SettingsContext'

const DebugComponent: React.FC = () => {
    const {
        center,
        destination,
        destinationName,
        initialSearch,
        departureAddressName,
        departureAddress,
        selectedIcons,
        isFocused,
        directions,
    } = useMapContext()

    const { isComparaisonPanel } = useDirectionContext()

    const { carInfoUser, setCarInfoUser } = useSettingsContext()

    return (
        <div className={styles.debugContainer}>
            <h2>Debug Information</h2>
            <div className={styles.debugItem}>
                <span>Center:</span>
                <pre>{JSON.stringify(center)}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Departure Address Name:</span>
                <pre>{departureAddressName}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Departure Address:</span>
                <pre>{JSON.stringify(departureAddress)}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Destination Name:</span>
                <pre>{destinationName}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Destination:</span>
                <pre>{JSON.stringify(destination)}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Initial Search:</span>
                <pre>{initialSearch.toString()}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Selected Mode</span>
                <ul>
                    {selectedIcons.map((icon, index) => (
                        <li key={index}>{icon.iconName}</li>
                    ))}
                </ul>
            </div>
            <div className={styles.debugItem}>
                <span>Is focused?</span>
                <pre>{isFocused.toString()}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Is comparaison panel?</span>
                <pre>{isComparaisonPanel.toString()}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>Directions</span>
                <pre>{directions?.overview_path.toString()}</pre>
            </div>
            <div className={styles.debugItem}>
                <span>carInfoUser</span>
                <pre>Make: {carInfoUser?.make}</pre>
                <pre>Model: {carInfoUser?.model}</pre>
                <pre>Year: {carInfoUser?.year}</pre>
                <pre>Fuel Type: {carInfoUser?.fuel_type}</pre>
                <pre>Combination MPG: {carInfoUser?.combination_mpg}</pre>
            </div>
        </div>
    )
}

export default DebugComponent
