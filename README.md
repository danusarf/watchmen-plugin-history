
#  watchmen-plugin-history

Watchmen (https://github.com/iloire/watchmen) plugin to view uptime then measure the SLA. This project is only experimental build, use it with your own caution.

  

## How to use this plugin :
This how to guide only cover using docker-compose

1. Add the environment variables by editing the [watchmen](https://github.com/iloire/watchmen)/**docker-compose.env** file:
> WATCHMEN_PG_USER=DB_USERNAME
> WATCHMEN_PG_HOST=DB_HOSTNAME_OR_IP
> WATCHMEN_PG_DATABASE=DB_NAME
> WATCHMEN_PG_PASSWORD=DB_PASSWORD
> WATCHMEN_PG_PORT=DB_PORT

2. Edit [watchmen](https://github.com/iloire/watchmen)/**package.json** on depedencies add: https://www.npmjs.com/package/watchmen-plugin-history, and use the final version on the depedencies (WARNING, IT'S STILL ON EXPERIMENTAL BUILD)
3. Run: 

> docker-compose build && docker-compose up


## Prepare your Postgres
1. To use this plugin you need postgres, you need postgresql (Only tested working on postgres 9.6).
2. Create the required tables:

> CREATE  TABLE  service_back(
> ID  SERIAL  PRIMARY  KEY  NOT  NULL,
> NAME  TEXT  NOT  NULL,
> DURATION  INT  NOT  NULL,
> LAST_OUTAGE  TIMESTAMP  NOT  NULL
> );
> CREATE  TABLE  service_status(
> ID  SERIAL  PRIMARY  KEY  NOT  NULL,
> NAME  TEXT  NOT  NULL,
> FIRST_PING  TIMESTAMP  NOT  NULL,
> LAST_PING  TIMESTAMP  NOT  NULL
> );

## Visualize Your Data
You can visualize you data using Grafana with PostgreSQL datasource. You can start trying using with this Dashboard. https://grafana.com/dashboards/8735.