import "@relmify/jest-fp-ts"

import { cheerioRunner } from "../../../lib/cheerio"
import { mergeSameConsecutiveLink } from "../links"

describe('mergeSameConsecutiveLink', () => {
  const html = `
<p class="bibliography">
Grant, Jaime M., Lisa A. Mottet, and Justin Tanis.
<em
  >National Transgender Discrimination Survey Report on Health and Health
  Care</em
>. Washington DC: National Center for Transgender Equality, 2010.
<a
  href="https://cancer-network.org/wp-content/uploads/2017/02/National_Transgender_Discrimination_Survey_Report_on_health_and_health_care.pdf"
  >https://cancer-network.org/wp-content/uploads/2017/02/National_ </a
><a
  href="https://cancer-network.org/wp-content/uploads/2017/02/National_Transgender_Discrimination_Survey_Report_on_health_and_health_care.pdf"
  >Transgender_Discrimination_Survey_Report_on_health_and_health_care.pdf</a
>.
</p>
`

  it('merges consecutive links', () => {
    const mergeLinks = cheerioRunner(mergeSameConsecutiveLink)
    const expected = `
<p class="bibliography">
Grant, Jaime M., Lisa A. Mottet, and Justin Tanis.
<em>National Transgender Discrimination Survey Report on Health and Health
  Care</em>. Washington DC: National Center for Transgender Equality, 2010.
<a href="https://cancer-network.org/wp-content/uploads/2017/02/National_Transgender_Discrimination_Survey_Report_on_health_and_health_care.pdf">https://cancer-network.org/wp-content/uploads/2017/02/National_Transgender_Discrimination_Survey_Report_on_health_and_health_care.pdf</a>.
</p>
`
    expect(mergeLinks(html)).toBe(expected)
  })
})
