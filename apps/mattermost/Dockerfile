# syntax=docker/dockerfile:1.6

FROM mattermost/mattermost-team-edition:9.10

USER root

COPY apps/mattermost/config/mattermost.json /mattermost/config/config.json
RUN chown mattermost:mattermost /mattermost/config/config.json

USER mattermost

EXPOSE 8065

