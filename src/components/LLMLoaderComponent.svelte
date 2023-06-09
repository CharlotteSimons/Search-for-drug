<script>
	let visible = false;

	function typewriter(node, { speed = 3, delay = 0 }) {
		const valid = (
			node.childNodes.length === 1 &&
			node.childNodes[0].nodeType === Node.TEXT_NODE
		);

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

		const delayString = '#'.repeat(delay)
		const text = delayString + node.textContent;
		const duration = text.length / (speed * 0.01);

		return {
			duration,
			tick: t => {
				const i = Math.trunc(text.length * t);
				node.textContent = text.slice(delay, i) 
			}
		};
	}
	
	let text1 = "We have the following medical profile:"
	let text2 = `Histology: histology of the patient.\r\nPrevious treatment: any previous treatment the patient has received.\r\nBiomarkers: known biomarkers. \r\nComorbidities: any other diseases the patient has. \r\nLab values: if available. \r\nOther: anything relevant.`
    let text3 = "We have the following eligibility criteria:"
    let text4 = `1. Description of the criterion. 2. Description another criterion... n. Description of the last criterion.`
    let text5 = "Which criteria can be screened based on the medical profile? Go criterion by criterion, and label with Yes/No/Unknown:"
    let text6 = `AI: {criterion 1}: Yes {criterion 2}: No ... {criterion n}: Unknown`
    let text7 = "For each criterion marked with “Yes”, explain why the medical profile does or does not meet the criterion, or whether it is unknown. Go criterion by criterion:"
    let text8 = `AI: {criterion 1}: As the has patient has certain characteristics, the criterion is met. {criterion 2}: As the patient has certain characteristics, the criterion is not met.
...
{criterion n}: As the ... `
    let text9 = 'Take the relevant criteria, and based on the explanations above, label them with "met", "not met" or "unknown":'
    let text10 = `AI: {criterion 1}: met {criterion 2}: not met ... {criterion n}: unknown`

    setTimeout(() => {
        visible = true;
    }, 1000);
</script>

<p class="italic text-gray-700 font-normal max-w-screen-sm mt-4 mb-4">Below an example of what AI is currently doing for each trial, as described in our <a href="https://arxiv.org/abs/2304.07396" class="underline">paper.</a></p>

<div class="max-w-screen-sm mt-4 mb-4 text-left">
{#if visible}
	<p in:typewriter>
		{text1}
	</p>
<p in:typewriter="{{speed:3, delay: text1.length}}" class="text-blue-500">
		{text2}
	</p>
<br>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length}}">
        {text3}
    </p>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length}}" class="text-blue-500">
        {text4}
    </p>
<br>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length + text4.length}}">
        {text5}
    </p>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length + text4.length + text5.length}}" class="text-purple-900">
        {text6}
    </p>
<br>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length + text4.length + text5.length + text6.length}}">
        {text7}
    </p>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length + text4.length + text5.length + text6.length + text7.length}}" class="text-purple-900">
        {text8}
    </p>
<br>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length + text4.length + text5.length + text6.length + text7.length + text8.length}}">
        {text9}
    </p>
<p in:typewriter="{{speed:3, delay: text1.length + text2.length + text3.length + text4.length + text5.length + text6.length + text7.length + text8.length + text9.length}}" class="text-purple-900">
        {text10}
    </p>
{/if}
</div>
