import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';

export const editLUKSModalAlert = (
  <AlertMessageForModals
    variant="warning"
    title={'The plan LUKS decryption keys were manually configured'}
    message={
      <>
        <p>Warning: not all virtual machines are configures using the same LUKS secret,</p>
        <p>updating the LUKS decryption keys will override the current configuration.</p>
      </>
    }
  />
);
