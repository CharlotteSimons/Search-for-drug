import { adapter } from 'sveltekit-adapter-aws';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),
	kit: {
		adapter: adapter({
			autoDeploy: true,
			stackName: 'svelte-search-fe',
			FQDN: 'svelte-search-fe.develop-mytomorrows.com',
			zoneName: 'Z06888232PVF6CDT1A7XI'
		})
	}
};

export default config;