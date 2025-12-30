# syntax=docker/dockerfile:1.6

FROM mattermost/mattermost-team-edition:9.10

USER root

COPY apps/mattermost/config/mattermost.json /mattermost/config/config.json
RUN chown mattermost:mattermost /mattermost/config/config.json

COPY apps/mattermost/scripts/railway-entrypoint.sh /usr/local/bin/railway-entrypoint.sh
RUN chmod +x /usr/local/bin/railway-entrypoint.sh \
	&& chown mattermost:mattermost /usr/local/bin/railway-entrypoint.sh

USER mattermost

EXPOSE 8065

ENTRYPOINT ["/usr/local/bin/railway-entrypoint.sh"]

