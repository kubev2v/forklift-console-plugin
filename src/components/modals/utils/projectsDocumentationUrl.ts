import { isUpstream } from '@utils/env';

const UPSTREAM_LATEST = 'https://docs.okd.io/latest/';

const workingWithProjectsURLs = {
  downstream: 'html/building_applications/projects#working-with-projects',
  upstream: 'applications/projects/working-with-projects.html',
};

export const getProjectsDocumentationUrl = (): string =>
  isUpstream()
    ? `${UPSTREAM_LATEST}${workingWithProjectsURLs.upstream}`
    : `${window.SERVER_FLAGS?.documentationBaseURL ?? ''}${workingWithProjectsURLs.downstream}`;
