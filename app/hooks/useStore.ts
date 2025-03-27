import { create } from 'zustand'
import { lists, homeItems, notifications } from '@/app/mock/data';
import { ListItem, Notification, HomeItem, Item } from '../types/type';
import { DataService } from '@/app/services/data';

// 创建一个全局数据服务实例
let dataServiceInstance: DataService | null = null;



interface Store {
    safeAreaTop: number;
    safeAreaBottom: number;
    menuOpen: boolean;
    notificationsOpen: boolean;
    currentPage: string | null;
    homeItems: HomeItem[];
    lists: ListItem[];
    notifications: Notification[];
    settings: {
        enableNotifications: boolean;
    };
    setMenuOpen: (menuOpen: boolean) => void;
    setNotificationsOpen: (notificationsOpen: boolean) => void;
    setSettings: (settings: { enableNotifications: boolean }) => void;
    setDone: (itemId: string, item:Item, done: boolean) => void;

}


const useAppStore = create<Store>((set, get) => ({
    // Initial state
    safeAreaTop: 0,
    safeAreaBottom: 0,
    menuOpen: false,
    notificationsOpen: false,
    currentPage: null,
    homeItems: homeItems,
    lists: lists,
    notifications: notifications,
    settings: {
        enableNotifications: true,
    },

    // Actions
    setMenuOpen: (menuOpen: boolean) => set({ menuOpen }),
    setNotificationsOpen: (notificationsOpen: boolean) => set({ notificationsOpen }),
    setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
    setDone: (itemId,item, done) => {
        // Implement logic to mark an item as done, example for `homeItems`
        const filteredItems = get().lists.find((list) => list.id === itemId);
        if (!filteredItems) return;
        filteredItems.items = filteredItems.items ?? [];
        filteredItems.items = filteredItems.items.map((i) => {
            if (i.name === item.name) {
                i.done = done;
            }
            return i;
        });
        const updatedItems = get().lists.map((list) => {
            if (list.id === itemId) {
                return filteredItems;
            }
            return list;
        });
        set({ lists: updatedItems });
    },
    
    // 从数据服务加载数据
    initializeData: async (dataService?: DataService) => {
        try {
            // 保存数据服务实例
            if (dataService) {
                dataServiceInstance = dataService;
            }
            
            // 如果没有提供数据服务实例，使用之前保存的实例
            const service = dataServiceInstance;
            if (!service) {
                console.error('No data service instance available');
                return;
            }
            
            // 并行加载所有数据
            const [listsData, homeItemsData, notificationsData] = await Promise.all([
                service.getLists(),
                service.getHomeItems(),
                service.getNotifications()
            ]);
            
            // 更新状态
            if (listsData && listsData.length > 0) {
                set({ lists: listsData });
            }
            
            if (homeItemsData && homeItemsData.length > 0) {
                set({ homeItems: homeItemsData });
            }
            
            if (notificationsData && notificationsData.length > 0) {
                set({ notifications: notificationsData });
            }
        } catch (error) {
            console.error('Failed to initialize data from service:', error);
        }
    },

}));

export default useAppStore;

