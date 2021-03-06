const constants = require("../../lib/constants")
const child_process = require("child_process")
const {fetchUser} = require("../../lib/collectors")

function reply(statusCode, content) {
	return {
		statusCode: statusCode,
		contentType: "application/json",
		content: JSON.stringify(content)
	}
}

let commit = ""
{
	const p = child_process.spawn("git", ["rev-parse", "--short", "HEAD"])
	p.on("error", console.error)
	p.stdout.on("data", data => {
		const string = data.toString()
		commit = "-" + string.match(/[0-9a-f]+/)[0]
	})
}

module.exports = [
	{
		route: `/api/user/(${constants.external.username_regex})`, methods: ["GET"], code: async ({fill}) => {
			const user = await fetchUser(fill[0])
			const data = user.export()
			return reply(200, data)
		}
	},
	{
		route: "/.well-known/nodeinfo", methods: ["GET"], code: async ({fill}) => {
			return reply(200, {
				link: [
					{
						rel: "http://nodeinfo.diaspora.software/ns/schema/2.0",
						href: `${constants.website_origin}/api/stats/2.0`
					}
				]
			})
		}
	},
	{
		route: "/api/stats/2.0", methods: ["GET"], code: async ({fill}) => {
			return reply(200, {
				version: "2.0",
				software: {
					name: "bibliogram",
					version: "1.0.0"+commit
				},
				protocols: [],
				services: {
					inbound: [
						"instagram"
					],
					outbound: []
				},
				openRegistrations: false,
				usage: {
					users: {
						total: 0,
						activeHalfyear: 0,
						activeMonth: 0
					}
				},
				metadata: {
					bibliogram: {
						version: "1.0",
						features: [
							"PAGE_PROFILE",
							"PAGE_POST",
							"API_STATS",
							"PAGE_HOME",
							"API_INSTANCES"
						]
					}
				}
			})
		}
	}
]
