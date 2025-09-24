import { useState, useEffect } from 'react';
import { useCallback } from 'react';

interface Notification {
	id: string;
	senderId: string;
	senderName: string;
	message: string;
	timestamp: Date;
}

export const useNotification = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [permission, setPermission] =
		useState<NotificationPermission>('default');

	useEffect(() => {
		if ('Notification' in window) {
			setPermission(Notification.permission);
		}
	}, []);

	const requestPermission = useCallback(async () => {
		if ('Notification' in window && permission === 'default') {
			const result = await Notification.requestPermission();
			setPermission(result);
		}
	}, [permission]);

	const showNotification = useCallback(
		(title: string, body: string, icon?: string) => {
			if (permission === 'granted' && 'Notification' in window) {
				const notification = new Notification(title, {
					body,
					icon: icon || '/favicon.ico',
					badge: '/favicon.ico',
					tag: 'chat-message',
				});

				// Auto close after 5 seconds
				setTimeout(() => {
					notification.close();
				}, 5000);
			}
		},
		[permission],
	);

	const addNotification = (notification: Notification) => {
		setNotifications((prev) => [...prev, notification]);

		// Auto remove after 5 seconds
		setTimeout(() => {
			setNotifications((prev) =>
				prev.filter((n) => n.id !== notification.id),
			);
		}, 5000);
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	return {
		notifications,
		addNotification,
		removeNotification,
		showNotification,
		requestPermission,
		permission,
	};
};
