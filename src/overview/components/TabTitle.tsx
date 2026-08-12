import { Button, ButtonVariant, Icon, Tooltip } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const TabTitle = ({ helpContent, title }: { helpContent: string; title: string }) => (
  <>
    {title}{' '}
    <Tooltip content={helpContent}>
      <Button
        className="pf-v6-u-px-xs"
        icon={
          <Icon size="md">
            <HelpIcon />
          </Icon>
        }
        variant={ButtonVariant.plain}
      />
    </Tooltip>
  </>
);

export default TabTitle;
