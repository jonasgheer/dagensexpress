# Dagensspørsmål

The app listens on port 3000. On startup the server expects to find a `database.sqlite` file under `/app/db`, and a `JWT_SECRET` as an environment variable.

`docker run -e "JWT_SECRET=secret" -v /home/user/db:/app/db -p 3000:3000/tcp dagensexpress:latest`

The container logs HTTP requests to `/app/log/access.log`
