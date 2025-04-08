import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';

export const editRootDiskModalAlert = (
  <AlertMessageForModals
    variant="warning"
    title={'The plan rootDisk keys was manually configured'}
    message={
      <>
        <p>Warning: not all virtual machines are configures using the same root disk number,</p>
        <p>updating the root disk number will override the current configuration.</p>
      </>
    }
  />
);
