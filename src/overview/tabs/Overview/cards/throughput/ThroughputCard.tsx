import { type FC, useEffect, useMemo, useRef, useState } from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useThroughputQuery } from '../../hooks/useThroughputQuery';
import { ThroughputTimeRange } from '../../utils/throughputTimeRanges';

import PlanSelectFilter from './PlanSelectFilter';
import ThroughputLineChart from './ThroughputLineChart';
import ThroughputTimeRangeSelect from './ThroughputTimeRangeSelect';

type ThroughputCardProps = {
  metricName: string;
  title: string;
};

const PLAN_ID_PREFIX_LENGTH = 8;

const ThroughputCard: FC<ThroughputCardProps> = ({ metricName, title }) => {
  const { t } = useForkliftTranslation();
  const [selectedRange, setSelectedRange] = useState<ThroughputTimeRange>(
    ThroughputTimeRange.Last1H,
  );
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const knownPlanIdsRef = useRef<Set<string>>(new Set());

  const { data, error, loaded } = useThroughputQuery(metricName, selectedRange);

  const hasData = loaded && !error;
  const noResults = hasData && isEmpty(data);

  const planOptions = useMemo(
    () =>
      data.map((series) => ({
        description: series.planId.slice(0, PLAN_ID_PREFIX_LENGTH),
        id: series.planId,
        name: series.planName,
      })),
    [data],
  );

  useEffect(() => {
    if (!loaded || error) return;

    const currentIds = data.map((series) => series.planId);
    const currentIdSet = new Set(currentIds);
    const trulyNewIds = currentIds.filter((id) => !knownPlanIdsRef.current.has(id));

    knownPlanIdsRef.current = currentIdSet;

    setSelectedPlanIds((prev) => {
      if (isEmpty(prev) && !isEmpty(currentIds)) {
        return currentIds;
      }

      const validPrev = prev.filter((id) => currentIdSet.has(id));
      return [...validPrev, ...trulyNewIds];
    });
  }, [data, loaded, error]);

  const renderBody = (): JSX.Element => {
    if (!loaded && !error) {
      return (
        <Bullseye>
          <Spinner aria-label={t('Loading throughput data')} />
        </Bullseye>
      );
    }

    if (error) {
      return (
        <Bullseye>
          <EmptyState
            icon={ExclamationCircleIcon}
            status="danger"
            titleText={t('Unable to load throughput data')}
          >
            <EmptyStateBody>
              {t(
                'There was an error loading the metrics. Verify the monitoring stack is available.',
              )}
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      );
    }

    return (
      <ThroughputLineChart
        series={data}
        visiblePlanIds={selectedPlanIds}
        timeRange={selectedRange}
        title={title}
      />
    );
  };

  return (
    <Card className="pf-m-full-height">
      <CardHeader
        actions={{
          actions: (
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <PlanSelectFilter
                  plans={planOptions}
                  selectedPlanIds={selectedPlanIds}
                  setSelectedPlanIds={setSelectedPlanIds}
                  isDisabled={noResults}
                />
              </FlexItem>
              <FlexItem>
                <ThroughputTimeRangeSelect
                  selectedRange={selectedRange}
                  setSelectedRange={setSelectedRange}
                />
              </FlexItem>
            </Flex>
          ),
        }}
      >
        <CardTitle className="forklift-title">{title}</CardTitle>
      </CardHeader>
      <CardBody className="forklift-overview__throughput-chart">{renderBody()}</CardBody>
    </Card>
  );
};

export default ThroughputCard;
