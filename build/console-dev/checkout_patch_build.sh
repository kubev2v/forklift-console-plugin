#! /bin/bash

SIDE=${SIDE:-backend}

if [[ ! -e openshift-console ]]; then
  git clone https://github.com/openshift/console.git openshift-console
else
  echo 'Using the existing "openshift-console" directory'
fi
cd openshift-console
git checkout ${console_branch}

if [[ -e ../patches/${console_branch} ]]; then
  for patch in $(
    find -L "../patches/${console_branch}" -name "${SIDE}*.patch" -type f |
    sort
  ); do
    echo "Applying patch $patch"
    git apply --whitespace=fix "$patch" || exit 20
  done
else
  echo "No patch source found for branch ${console_branch}"
fi

echo "Building ${SIDE} from: $(git log -1 --decorate=short)"
./build-${SIDE}.sh
