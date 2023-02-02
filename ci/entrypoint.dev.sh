#!/bin/bash

echo 'Starting ssh server:'
echo '  user: dev'
echo '  pass: dev'
echo ''

ssh-keygen -A

/sbin/sshd -D

sleep infinity
