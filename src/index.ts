import * as E from "fp-ts/Either"

import { program } from "./main"

program().then(E.fold(console.error, console.log))
