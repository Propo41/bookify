![image](https://github.com/user-attachments/assets/c624fbc6-5673-4c85-ae4a-74d298b73089)

# Get started
1. Copy the `.env.example` file as `.env.development` file in the root dir and fill the required keys. Obtain the OAuth credentials by following this [guide](#hosting-yourself)
2. Run `npm run migration:run` to create the migrations
3. Run the app using: `npm run start:dev`

## Chrome extension development

1. Copy the `.env.example` file as `.env.development.chrome` file in the root dir and fill the required keys as mentioned earlier. <br> 
Note: The REDIRECT_URL should be in the format `https://<extension-id>.chromiumapp.org` 
2. Run `npm run start:chrome`

# Use cases

#### CASE I: Quick Client Meeting Scheduling

```
Scenario: A team member gets a sudden request to set up a meeting in a conference room.

Action: The team member opens the tool, selects the start time and minimum number of seats required, and optionally chooses a specific floor if needed. 

Outcome: A suitable meeting room is booked immediately, saving the hassle of running through a bunch of options from the Google Calender.

```
#### CASE II: Overrunning Meeting
```
Scenario: A team/team member is running a meeting in a room X that exceeds the scheduled time, and they need to find another room to continue without interruptions. 

Action: The team member opens the tool, and has the option to either increase the time of the current room (if no collisions exists) or quickly book another room with just a click 

Outcome: The system quickly books a room, and the team transitions smoothly without the hassle of manually browsing for room availability.
```

#### CASE III: Floor-Specific Room Requirement
```
*Scenario*: A manager prefers to book rooms on a particular floor to maintain proximity to their team. 

Action: The manager uses the tool, inputs the necessary seats, and specifies the floor. 

Outcome: The tool books a room on the specified floor, optimizing convenience for the manager and their team.
```
#### CASE IV: Booking During a High-Demand Period
```
Scenario:  During a peak time, meeting rooms are in high demand. Manually searching for a room would take time.

Action: The user enters their seat requirements and start time. The tool searches and books the best available room.

Outcome: A room is secured swiftly, even in high-demand periods, preventing frustration and delays.
```


# Github actions

The following env secrets needs to be configured in the github repository: 

```bash
APP_PORT=
AZURE_WEBAPP_PUBLISH_PROFILE=
ROOMS=
SQLITE_DB=
TYPEORM_CLI=
```

# Deployment

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

# Sqlite file restore & backup

From the Azure portal, head over to SSH and copy the sqlite file from `/home/site/wwwroot/bookify.sqlite` to `/home/bookify.sqlite`.

To backup the file, you can use an FTP client such as FileZilla. Head over to the App Service's Deployment Center and ensure FTP is enabled. Note the `FTP Hostname`, `Username`, and `Password`.

```

## Commands

### Entering docker container's mysql

```sh
docker exec -it <containerid> sh # to enter a container's bash
mysql -uroot -proot # to enter mysql
```

# Hosting yourself

1. Create a Google cloud project or follow this [guide](https://developers.google.com/calendar/api/quickstart/js#set_up_your_environment)
1. Enable the [Admin SDK API](https://console.cloud.google.com/apis/api/admin.googleapis.com/overview)
2. Enable the [Calender API](https://console.cloud.google.com/flows/enableapi?apiid=calendar-json.googleapis.com)


# Reference

- [Google Free busy API](https://developers.google.com/calendar/api/v3/reference/freebusy/query?apix_params=%7B%22resource%22%3A%7B%22timeMin%22%3A%222024-08-27T00%3A00%3A00%2B02%3A00%22%2C%22timeMax%22%3A%222024-09-27T23%3A59%3A59%2B02%3A00%22%2C%22items%22%3A%5B%7B%22id%22%3A%22Ada%20Bit%2010%40resource.calendar.google.com%22%7D%2C%7B%22id%22%3A%22c_1888flqi3ecr4gb0k9armpk8k9ics%40resource.calendar.google.com%22%7D%2C%7B%22id%22%3A%22RESOURCE_ID_3%40resource.calendar.google.com%22%7D%5D%7D%7D )

- [Resources API](https://developers.google.com/admin-sdk/directory/reference/rest/v1/resources.calendars/list?apix_params=%7B%22customer%22%3A%22my_customer%22%2C%22maxResults%22%3A20%7D)

- [Hosting on Azure App Service](https://docs.github.com/en/actions/use-cases-and-examples/deploying/deploying-nodejs-to-azure-app-service)

- [Azure file system](https://github.com/projectkudu/kudu/wiki/Understanding-the-Azure-App-Service-file-system)

- [Chrome extension guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world)

- [Chrome extension Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)