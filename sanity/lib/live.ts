import { defineLive } from "next-sanity/live";
import { client } from './client'

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    // Live content is currently only available with the experimental API
    // https://www.sanity.io/docs/api-versioning
    apiVersion: 'vX',
  }),
  serverToken: process.env.SANITY_API_TOKEN,
  browserToken: null,
  fetchOptions: {
    revalidate: 0,
  },
});
