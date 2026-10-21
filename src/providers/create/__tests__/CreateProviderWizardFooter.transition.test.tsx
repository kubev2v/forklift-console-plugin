import { type FC, useState } from 'react';

import { Wizard, WizardStep } from '@patternfly/react-core';
import { fireEvent, render, screen } from '@testing-library/react';

import CreateProviderWizardFooter from '../CreateProviderWizardFooter';
import { PROVIDER_DETAILS_STEP_ID, PROVIDER_PLACEMENT_STEP_ID } from '../utils/wizardConstants';

jest.mock('react-router', (): object => ({ useNavigate: (): jest.Mock => jest.fn() }));
jest.mock('src/utils/i18n', (): object => ({
  useForkliftTranslation: (): object => ({ t: (key: string): string => key }),
}));

const WizardHarness: FC = () => {
  const [providerCreated, setProviderCreated] = useState(false);

  return (
    <Wizard
      footer={
        <CreateProviderWizardFooter
          canCreate
          canDeploy={false}
          createdProviderUrl={providerCreated ? '/provider/details' : undefined}
          isApplianceSelected
          isSubmitting={false}
          onCreate={async () => {
            await Promise.resolve();
            setProviderCreated(true);
            return true;
          }}
          onDeploy={(): Promise<void> => Promise.resolve()}
        />
      }
    >
      <WizardStep id={PROVIDER_DETAILS_STEP_ID} isDisabled={providerCreated} name="Details">
        Provider fields
      </WizardStep>
      <WizardStep
        id={PROVIDER_PLACEMENT_STEP_ID}
        isDisabled={!providerCreated}
        isHidden={!providerCreated}
        name="Sourcing appliance"
      >
        Placement fields
      </WizardStep>
    </Wizard>
  );
};

describe('CreateProviderWizardFooter', () => {
  it('opens placement after the newly created Provider enables the step', async () => {
    render(<WizardHarness />);
    fireEvent.click(screen.getByTestId('provider-create-button'));

    expect(await screen.findByText('Placement fields')).toBeVisible();
    expect(screen.getByTestId('provider-deploy-button')).toBeDisabled();
  });
});
