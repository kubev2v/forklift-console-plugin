# Local NFS server for forklift CI tasks

Some forklift CI tasks require an NFS server running on the localhost exporting the directory /home/nfsshare,
to set up this NFS server on fedora, see the bash example below:

```bash
sudo dnf install nfs-utils -y

sudo mkdir -p /home/nfsshare
sudo chown -R nobody:nobody /home/nfsshare
sudo chmod 777 /home/nfsshare
sudo bash -c 'echo "/home/nfsshare  *(insecure,rw,no_root_squash)" >>/etc/exports'
sudo exportfs -a

sudo systemctl restart nfs-server
```
