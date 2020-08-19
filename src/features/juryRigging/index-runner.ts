import { parseHeadingsTxtToHtml } from './toc'

const input = `
Section01.xhtml		sec1		Cover
Section02.xhtml		sec2	H1	Contents
Section03.xhtml		sec3	H1	1. Introduction
Section04.xhtml		sec4	H1	2. What is your key message?
Section05.xhtml		sec5	H1	3. Preparation for your speech		
Section06.xhtml		sec6	H1	4. The structure of your speech
Section07.xhtml		sec7	H1	5. Speaking with notes
Section08.xhtml		sec8	H1	6. Just before you go on…
Section09.xhtml		sec9	H1	7. Reading your audience
Section10.xhtml		sec10	H1	8. Connecting with your audience
Section11.xhtml		sec11	H1	9. Using humour
Section12.xhtml		sec12	H1	10. Sustaining attention
Section13.xhtml		sec13	H1	11. Speaking without notes
Section14.xhtml		sec14	H1	12. Pulling it all together
Section15.xhtml		sec15	H1	13. Conclusion
Section16.xhtml		sec16	H1	Appendix – the cue cards for my speech:
`

console.log(parseHeadingsTxtToHtml(input, { joiner: '\n' }))
