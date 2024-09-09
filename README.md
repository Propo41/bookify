![image](https://github.com/user-attachments/assets/c624fbc6-5673-4c85-ae4a-74d298b73089)

# Get started
1. Place the `.env.development` file or `.env` file in the root dir
2. To obtain the list of meeting spaces that are allocated for your organization, use the [Google directory API](https://developers.google.com/admin-sdk/directory/reference/rest/v1/resources.calendars/list?apix_params=%7B%22customer%22%3A%22my_customer%22%2C%22maxResults%22%3A20%7D) to obtain the list and format them according to `src/calender/interfaces/room.interface.ts`. Finally place the file as `rooms.ts` file in `src/config`. 
3. Run `npm run migration:run` to create the migrations
4. Run the app using: `npm run start:dev`
5. Run the client using `npm run start:client`


### List available rooms

```bash
curl 
  --location --globoff '{{baseUrl}}/rooms' \
  --header 'Authorization: Bearer <token>'
```

### Book room

```bash
curl 
  --location --globoff '{{baseUrl}}/room' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <token>' \
  --data '{
      "startTime": "2024-08-31T10:30:00+06:00",
      "duration": 30,
      "seats": 1,
      "floor": 1,
      "createConference": true,
      "title": "Quick meeting API",
      "attendees": []
    }'

```

### Update room

```bash
# todo
```


### Delete room

```bash

curl 
  --location --globoff --request DELETE '{{baseUrl}}/room' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <token>' \
  --data '{
    "eventId": "4r4bddp2bfkgg1tic1vh84sit8"
}'

```

## Todo

- add some sort of mutex or a buffer to prevent race conditions


## Github actions

The following env secrets needs to be configured in the github repository: 

```bash
APP_PORT=
AZURE_WEBAPP_PUBLISH_PROFILE=
ROOMS=
SQLITE_DB=
TYPEORM_CLI=
```

## Deployment

Make sure to create the following environment secrets in the Azure App service:

```bash
APP_PORT=
AZURE_WEBAPP_PUBLISH_PROFILE=
JWT_SECRET=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_REDIRECT_URL=
SQLITE_DB=
TYPEORM_CLI=
APP_DOMAIN=
```

### Sqlite file restore & backup

From the Azure portal, head over to SSH and copy the sqlite file from `/home/site/wwwroot/bookify.sqlite` to `/home/bookify.sqlite`.

To backup the file, you can use an FTP client such as FileZilla. Head over to the App Service's Deployment Center and ensure FTP is enabled. Note the `FTP Hostname`, `Username`, and `Password`.

```

## Commands

### Entering docker container's mysql

```sh
docker exec -it <containerid> sh # to enter a container's bash
mysql -uroot -proot # to enter mysql
```

### Migrations

Once you get into production you'll need to synchronize model changes into the database. Typically, it is unsafe to use `synchronize: true` for schema synchronization on production once you get data in your database. Here is where migrations come to help.

A migration is just a single file with sql queries to update a database schema and apply new changes to an existing database. There are two methods you must fill with your migration code: **up** and **down**. up has to contain the code you need to perform the migration. down has to revert whatever up changed. down method is used to revert the last migration.

More: 

- [NestJs Database](https://docs.nestjs.com/techniques/database)
- [TypeORM](https://typeorm.io/migration)

### Creating new migrations

Let's say we want to change the User.username to User.fullname. We would run: 
```bash
npm run migration:create --name=UserNameChange
``` 
After you run the command you can see a new file generated in the "migration" directory named `{TIMESTAMP}-UserNameChange.ts` where `{TIMESTAMP}` is the current timestamp when the migration was generated. Now you can open the file and add your migration sql queries there.

```ts
import { MigrationInterface, QueryRunner } from "typeorm"

export class UserNameChangeTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "username" TO "fullname"`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "fullname" TO "username"`,
        ) // reverts things made in "up" method
    }
}
```

### Running migrations

Once you have a migration to run on production, you can run them using a CLI command:

```ts
npm run migration:run
```

 **Note**: The `migration:run` and `migration:revert` commands only work on .js files. Thus the typescript files need to be compiled before running the commands. Alternatively, you can use `ts-node` in conjunction with `typeorm` to run .ts migration files. This has already been done in the `package.json`

This command will execute all pending migrations and run them in a sequence ordered by their timestamps. This means all sql queries written in the up methods of your created migrations will be executed. That's all! Now you have your database schema up-to-date.

If for some reason you want to revert the changes, you can run:

```ts
npm run migration:revert
```
This command will execute down in the latest executed migration. If you need to revert multiple migrations you must call this command multiple times.



### Syncing code changes

TypeORM is able to automatically generate migration files with schema changes you made in your **code**. Let's say you have a Post entity with a title column, and you have changed the name title to name. You can run following command:

```ts
npm run migration:generate
```
You don't need to write the queries on your own. The rule of thumb for generating migrations is that you generate them after **each** change you made to your models. 


## Reference

- [Google Free busy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query?apix_params=%7B%22resource%22%3A%7B%22timeMin%22%3A%222024-08-27T00%3A00%3A00%2B02%3A00%22%2C%22timeMax%22%3A%222024-09-27T23%3A59%3A59%2B02%3A00%22%2C%22items%22%3A%5B%7B%22id%22%3A%22Ada%20Bit%2010%40resource.calendar.google.com%22%7D%2C%7B%22id%22%3A%22c_1888flqi3ecr4gb0k9armpk8k9ics%40resource.calendar.google.com%22%7D%2C%7B%22id%22%3A%22RESOURCE_ID_3%40resource.calendar.google.com%22%7D%5D%7D%7D )

- [Resources API](https://developers.google.com/admin-sdk/directory/reference/rest/v1/resources.calendars/list?apix_params=%7B%22customer%22%3A%22my_customer%22%2C%22maxResults%22%3A20%7D)

- [Hosting on Azure App Service](https://docs.github.com/en/actions/use-cases-and-examples/deploying/deploying-nodejs-to-azure-app-service)

- [Azure file system](https://github.com/projectkudu/kudu/wiki/Understanding-the-Azure-App-Service-file-system)