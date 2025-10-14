import type { StaticImageData } from 'next/image'

import chicken from './chicken.webp'
import cow from './cow.webp'
import deer from './deer.webp'
import duck from './duck.webp'
import goat from './goat.webp'
import me from './me.webp'
import mountainGoat from './mountain-goat.webp'
import pig from './pig.webp'

export const iconMap: Record<string, StaticImageData> = {
  돼지: pig,
  사슴: deer,
  산양: mountainGoat,
  염소: goat,
  오리: duck,
  육우: cow,
  젖소: cow,
  한우: cow,
  메추리: me,
  '종계/산란계': chicken,
  육계: chicken,
}
