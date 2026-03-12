import { type FC, useEffect, useMemo, useState } from 'react';

import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Spinner,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { useThroughputQuery } from '../../hooks/useThroughputQuery';
import { ThroughputTimeRange } from '../../utils/throughputTimeRanges';

import PlanSelectFilter from './PlanSelectFilter';
import ThroughputLineChart from './ThroughputLineChart';
import ThroughputTimeRangeSelect from './ThroughputTimeRangeSelect';

type ThroughputCardProps = {
  metricName: string;
  title: string;
};

const ThroughputCard: FC<ThroughputCardProps> = ({ metricName, title }) => {
  const [selectedRange, setSelectedRange] = useState<ThroughputTimeRange>(
    ThroughputTimeRange.Last1H,
  );
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  const { data, error, loaded } = useThroughputQuery(metricName, selectedRange);

  const hasData = loaded && !error;
  const noResults = hasData && isEmpty(data);

  const planOptions = useMemo(
    () => data.map((series) => ({ id: series.planId, name: series.planName })),
    [data],
  );

  useEffect(() => {
    const currentIds = data.map((series) => series.planId);
    setSelectedPlanIds((prev) => {
      if (isEmpty(prev)) {
        return currentIds;
      }

      const newIds = currentIds.filter((id) => !prev.includes(id));
      const validPrev = prev.filter((id) => currentIds.includes(id));
      return [...validPrev, ...newIds];
    });
  }, [data]);

  const renderBody = (): JSX.Element => {
    if (!loaded && !error) {
      return (
        <Bullseye>
          <Spinner />
        </Bullseye>
      );
    }

    return <ThroughputLineChart series={data} visiblePlanIds={selectedPlanIds} />;
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
