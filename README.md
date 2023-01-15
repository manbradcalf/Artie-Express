# How to release
`sudo systemctl restart pm2-ben`
The node process is run on a linux box hosted by vultr. systemctl owns the pm2 process.

# How to check the status
`sudo systemctl status pm2-ben`

# How is it hosted
Nginx is proxying requests to artiediy.org to port 3000. 
