import type { FC } from 'react';

import HistoryCard from './cards/HistoryCard';

const ForkliftControllerHistoryTab: FC = () => (
  <div className="co-dashboard-body">
    <div>
      <HistoryCard />
    </div>
  </div>
);

export default ForkliftControllerHistoryTab;
