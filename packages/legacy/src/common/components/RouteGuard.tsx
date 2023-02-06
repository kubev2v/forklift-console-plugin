import * as React from 'react';
import { useHistory } from 'react-router';
import { UnregisterCallback } from 'react-router';
import { ConfirmModal } from 'legacy/src/common/components/ConfirmModal';

const blockUnload = (event: BeforeUnloadEvent) => {
  // The beforeunload event is weird in different browsers.
  // See: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#example
  event.preventDefault();
  event.returnValue = '';
};

interface IRouteGuard {
  when: boolean;
  title: string;
  message: string | JSX.Element;
  okText?: string;
  cancelText?: string;
}

export const RouteGuard: React.FunctionComponent<IRouteGuard> = ({
  when,
  title,
  message,
  okText = 'OK',
  cancelText = 'Cancel',
}) => {
  const history = useHistory();
  const [showRouteGuard, setShowRouteGuard] = React.useState(when);
  const [currentPath, setCurrentPath] = React.useState('');

  const unblockFnRef = React.useRef<UnregisterCallback | null>(null);
  const unblock = () => {
    if (unblockFnRef.current) {
      unblockFnRef.current();
      unblockFnRef.current = null;
    }
  };

  React.useEffect(() => {
    if (when) {
      // When browser history routing happens (clicking links, back/forward) we can handle it with our custom modal.
      unblockFnRef.current = history.block((prompt) => {
        setCurrentPath(prompt.pathname);
        setShowRouteGuard(true);
        return false;
      });
      // When the page is being unloaded (closing or reloading tab), we have to trigger a native JS confirm dialog.
      window.addEventListener('beforeunload', blockUnload);
    }
    return () => {
      unblock();
      window.removeEventListener('beforeunload', blockUnload);
    };
  }, [history, when]);

  const handleOk = React.useCallback(() => {
    unblock();
    history.push(currentPath);
  }, [currentPath, history]);

  const handleCancel = React.useCallback(() => setShowRouteGuard(false), []);

  return (
    <ConfirmModal
      title={title}
      isOpen={showRouteGuard}
      toggleOpen={handleCancel}
      mutateFn={handleOk}
      cancelButtonText={cancelText}
      confirmButtonText={okText}
      body={message}
    />
  );
};
