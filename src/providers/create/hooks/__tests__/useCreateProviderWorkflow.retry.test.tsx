import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import onCreateCopyApplianceTemplate from 'src/providers/details/tabs/Details/components/DetailsSection/onCreateCopyApplianceTemplate';
import { DISK_TRANSFER_METHOD_ANNOTATION, VddkSetupMode } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@forklift-ui/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ProviderFormFieldId } from '../../fields/constants';
import type { CreateProviderFormData } from '../../types';
import { createProviderOnce } from '../../utils/createProviderOnce';
import { useCreateProviderWorkflow } from '../useCreateProviderWorkflow';

const mockNavigate = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock('react-router', (): object => ({ useNavigate: (): jest.Mock => mockNavigate }));
jest.mock('@utils/analytics/hooks/useForkliftAnalytics', (): object => ({
  useForkliftAnalytics: (): object => ({ trackEvent: mockTrackEvent }),
}));
jest.mock('../../utils/createProviderOnce', () => ({ createProviderOnce: jest.fn() }));
jest.mock(
  'src/providers/details/tabs/Details/components/DetailsSection/onCreateCopyApplianceTemplate',
  () => ({ __esModule: true, default: jest.fn() }),
);

const provider = {
  metadata: {
    annotations: { [DISK_TRANSFER_METHOD_ANNOTATION]: VddkSetupMode.CopyAppliance },
    name: 'source',
    namespace: 'ns',
    uid: 'uid',
  },
  spec: { type: 'vsphere' },
} as unknown as V1beta1Provider;
const formData = {
  [ProviderFormFieldId.ProviderName]: 'source',
  [ProviderFormFieldId.ProviderProject]: 'ns',
  [ProviderFormFieldId.ProviderType]: 'vsphere',
  [ProviderFormFieldId.ShowDefaultProjects]: false,
  [ProviderFormFieldId.VsphereVddkSetupMode]: VddkSetupMode.CopyAppliance,
} as CreateProviderFormData;

const WorkflowHarness: FC = () => {
  const { handleSubmit } = useForm<CreateProviderFormData>({ defaultValues: formData });
  const { apiError, createdProvider, onCreate, onDeploy } = useCreateProviderWorkflow({
    handleSubmit,
  });

  return (
    <>
      <button
        onClick={() => {
          onCreate(jest.fn()).catch(() => undefined);
        }}
        type="button"
      >
        Create
      </button>
      <button
        onClick={() => {
          onDeploy({
            canDeploy: true,
            placement: {
              datastore: 'ds',
              folder: '/folder',
              network: 'network',
              resourcePool: '/pool',
            },
          }).catch(() => undefined);
        }}
        type="button"
      >
        Deploy
      </button>
      <span>{createdProvider ? 'Provider created' : 'Provider missing'}</span>
      <span>{apiError?.message}</span>
    </>
  );
};

describe('useCreateProviderWorkflow retries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockResolvedValue(undefined);
    (createProviderOnce as jest.MockedFunction<typeof createProviderOnce>).mockImplementation(
      (_data, progress) => {
        progress.provider = provider;
        return Promise.resolve(provider);
      },
    );
  });

  it('retries template deployment without recreating the Provider', async () => {
    const createTemplate = onCreateCopyApplianceTemplate as jest.MockedFunction<
      typeof onCreateCopyApplianceTemplate
    >;
    createTemplate.mockRejectedValueOnce(new Error('Temporary template failure'));
    createTemplate.mockResolvedValueOnce({} as never);
    render(<WorkflowHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await screen.findByText('Provider created');
    expect(mockNavigate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }));
    await screen.findByText('Temporary template failure');
    fireEvent.click(screen.getByRole('button', { name: 'Deploy' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
    expect(createTemplate).toHaveBeenCalledTimes(2);
    expect(createProviderOnce).toHaveBeenCalledTimes(1);
  });

  it('blocks same-tick duplicate deployments before the loading state rerenders', async () => {
    const createTemplate = onCreateCopyApplianceTemplate as jest.MockedFunction<
      typeof onCreateCopyApplianceTemplate
    >;
    createTemplate.mockResolvedValue({} as never);
    render(<WorkflowHarness />);
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await screen.findByText('Provider created');

    const deploy = screen.getByRole('button', { name: 'Deploy' });
    fireEvent.click(deploy);
    fireEvent.click(deploy);

    expect(createTemplate).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});
