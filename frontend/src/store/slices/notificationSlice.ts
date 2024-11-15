import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import type { Notification } from '../../services/api';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

// Async thunks
export const fetchUnreadNotifications = createAsyncThunk(
    'notifications/fetchUnread',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.getUnreadNotifications();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: number, { rejectWithValue }) => {
        try {
            const response = await apiService.markNotificationRead(notificationId);
            return notificationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
        }
    }
);

export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiService.markAllNotificationsRead();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Unread Notifications
            .addCase(fetchUnreadNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.length;
            })
            .addCase(fetchUnreadNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Mark as Read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark All as Read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.read = true;
                });
                state.unreadCount = 0;
            });
    },
});

export const { clearError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
