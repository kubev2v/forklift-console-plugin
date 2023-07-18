import React, { FC } from 'react';
import { getOperatorPhase } from 'src/modules/Overview/utils/helpers/getOperatorPhase';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import OperatorStatus from '../../../components/OperatorStatus';

type OperatorCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

export const OperatorCard: FC<OperatorCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const phaseObj = getOperatorPhase(obj);

  return (
    <Card>
      <CardTitle>{t('Operator')}</CardTitle>
      <CardBody>
        <DescriptionList
          columnModifier={{
            default: '3Col',
          }}
        >
          <DetailsItem
            title={t('Namespace')}
            content={
              <ResourceLink
                groupVersionKind={{ version: 'v1', kind: 'Namespace' }}
                name={obj?.metadata?.namespace}
                namespace={obj?.metadata?.namespace}
              />
            }
            moreInfoLink={
              'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces'
            }
            helpContent={t(
              `Namespace defines the space within which each name must be unique.
               An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation.
               Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty.`,
            )}
            crumbs={['metadata', 'namespace']}
          />

          <DetailsItem
            title={t('Created at')}
            content={<Timestamp timestamp={obj?.metadata?.creationTimestamp} />}
            helpContent={
              <Text>
                {t(
                  `CreationTimestamp is a timestamp representing the server time when this object was created.
                   It is not guaranteed to be set in happens-before order across separate operations.
                  Clients may not set this value. It is represented in RFC3339 form and is in UTC.`,
                )}
              </Text>
            }
            crumbs={['metadata', 'creationTimestamp']}
          />

          <DetailsItem
            title={t('Status')}
            content={<OperatorStatus status={phaseObj.phase} />}
            helpContent={
              <>
                <Text component={TextVariants.p}>
                  {t(`Operator conditions define the current state of the controller`)}
                </Text>
                <Text component={TextVariants.p}>
                  {t(`To troubleshoot, check the Forklift controller pod events and logs.`)}
                </Text>
                <Text component={TextVariants.p} className="pf-u-disabled-color-100">
                  {phaseObj?.message && t('Message: {{message}}', phaseObj)}
                </Text>
              </>
            }
            crumbs={['status', 'conditions']}
          />
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default OperatorCard;
