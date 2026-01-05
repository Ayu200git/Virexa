/**
<<<<<<< HEAD
 * This configuration file lets you run `$ sanity [command]` in this folder
 * Go to https://www.sanity.io/docs/cli to learn more.
 */
import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },

  typegen: {
    path: "./src/**/*.{ts,tsx,js,jsx}",
    schema: "schema.json",
    generates: "./sanity.types.ts",
    overloadClientMethods: true,
  },
});
=======
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({ api: { projectId, dataset } })

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  // ...rest of config
  typegen: {
    path: "./src/**/*.{ts,tsx,js,jsx}", // glob pattern to your typescript files. Can also be an array of paths
    schema: "schema.json", // path to your schema file, generated with 'sanity schema extract' command
    generates: "./sanity.types.ts", // path to the output file for generated type definitions
    overloadClientMethods: true, // set to false to disable automatic overloading the sanity client
  },
})
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
