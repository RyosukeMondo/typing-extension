// Type definitions for Chrome extension API
declare namespace chrome {
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      clear(callback?: () => void): void;
    }
    
    const local: StorageArea;
    const sync: StorageArea;
  }

  namespace runtime {
    interface MessageSender {
      tab?: {
        id?: number;
        url?: string;
      };
      frameId?: number;
      id?: string;
      url?: string;
      origin?: string;
    }

    function sendMessage<T = any>(
      message: any,
      responseCallback?: (response: T) => void
    ): void;

    function sendMessage<T = any>(
      extensionId: string,
      message: any,
      responseCallback?: (response: T) => void
    ): void;

    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
    };
  }
}
