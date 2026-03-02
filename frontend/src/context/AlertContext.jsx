import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

const AlertItem = ({ alert, removeAlert }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setIsExiting(true);
        }, alert.duration - 300);

        const timer2 = setTimeout(() => {
            removeAlert(alert.id);
        }, alert.duration);

        // start progress bar after a tiny delay to allow CSS transition to trigger
        const timer3 = setTimeout(() => setProgress(0), 10);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [alert, removeAlert]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => removeAlert(alert.id), 300);
    };

    const icons = {
        success: <CheckCircle className="text-green-500" size={24} />,
        error: <XCircle className="text-red-500" size={24} />,
        warning: <AlertTriangle className="text-orange-500" size={24} />,
        info: <Info className="text-blue-500" size={24} />
    };

    const bgColors = {
        success: 'bg-green-50 border-green-500 dark:bg-green-900/20 text-green-900 dark:text-green-100',
        error: 'bg-red-50 border-red-500 dark:bg-red-900/20 text-red-900 dark:text-red-100',
        warning: 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100',
        info: 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
    };

    const progressColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500'
    };

    return (
        <div
            className={`relative flex items-start p-4 mb-3 border-l-4 rounded-lg shadow-lg transition-all duration-300 transform w-80 md:w-96 overflow-hidden ${bgColors[alert.type] || bgColors.info} ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'
                }`}
            role="alert"
        >
            <div className="mr-3">{icons[alert.type] || icons.info}</div>
            <div className="flex-1 mr-4 text-sm font-semibold">
                {alert.message}
            </div>
            <button onClick={handleClose} className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Close alert">
                <X size={18} />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 right-0">
                <div
                    className={`h-full ${progressColors[alert.type]}`}
                    style={{ width: `${progress}%`, transition: `width ${alert.duration}ms linear` }}
                ></div>
            </div>
        </div>
    );
};

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const addAlert = (type, message, duration = 3000) => {
        const id = Date.now() + Math.random().toString();
        setAlerts((prev) => [...prev, { id, type, message, duration }]);
    };

    const removeAlert = (id) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    };

    const success = (message, duration) => addAlert('success', message, duration);
    const error = (message, duration) => addAlert('error', message, duration);
    const warning = (message, duration) => addAlert('warning', message, duration);
    const info = (message, duration) => addAlert('info', message, duration);

    return (
        <AlertContext.Provider value={{ success, error, warning, info }}>
            {children}
            <div className="fixed top-20 right-4 z-50 flex flex-col items-end pointer-events-none">
                {alerts.map((alert) => (
                    <div key={alert.id} className="pointer-events-auto">
                        <AlertItem alert={alert} removeAlert={removeAlert} />
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
};
