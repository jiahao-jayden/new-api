/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Announcement01,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award01,
  Bank,
  BarChart03,
  Beaker01,
  Bell01,
  BookOpen01,
  Brush01,
  Calendar,
  CalendarDate,
  Camera01,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronLeftDouble,
  ChevronRight,
  ChevronRightDouble,
  ChevronUp,
  Circle,
  ClipboardCheck,
  Clock,
  Cloud01,
  Coins01,
  Copy01,
  CpuChip01,
  CreditCard01,
  CurrencyDollar,
  Cursor01,
  Database01,
  Diamond01,
  Dotpoints01,
  DotsHorizontal,
  DotsVertical,
  Download01,
  Edit03,
  Edit05,
  Eye,
  EyeOff,
  File01,
  File02,
  File06,
  FileCode01,
  FileQuestion01,
  FilterLines,
  Gift01,
  GitBranch01,
  Globe01,
  GraduationHat01,
  Grid01,
  Hand,
  Headphones01,
  Heart,
  HelpCircle,
  Home03,
  Hourglass01,
  Hourglass02,
  Image01,
  InfoCircle,
  Key01,
  LayersThree01,
  LayoutGrid01,
  Lightbulb02,
  Link01,
  LinkBroken01,
  Lock01,
  LogIn01,
  LogOut01,
  MagicWand01,
  Mail01,
  Maximize01,
  Menu01,
  MessageChatCircle,
  MessageDotsSquare,
  MessageSquare01,
  Microphone01,
  Minus,
  Moon01,
  MusicNote01,
  Package,
  Palette,
  Paperclip,
  Play,
  Plus,
  PlusCircle,
  Receipt,
  RefreshCcw01,
  RefreshCw01,
  Save01,
  Scan,
  SearchLg,
  Send01,
  Settings01,
  Settings02,
  Settings04,
  Share07,
  Shield01,
  Shuffle01,
  SlashCircle01,
  Sliders01,
  Stars01,
  Sun,
  SwitchVertical01,
  Tag01,
  Telescope,
  TerminalSquare,
  ThumbsUp,
  Ticket01,
  Toggle03Left,
  Tool01,
  Translate01,
  Trash01,
  TrendDown01,
  TrendUp01,
  Trophy01,
  User01,
  Users01,
  VideoRecorder,
  Wallet01,
  Wifi,
  WifiOff,
  XCircle,
  XClose,
  Zap,
  ZapFast,
  ZoomIn,
} from '@untitledui/icons'
import type { ComponentPropsWithRef, CSSProperties } from 'react'

import { cn } from '@/lib/utils'

export type GameIconProps = ComponentPropsWithRef<'svg'> & {
  /** Compatibility name for existing consumers; visuals use Untitled UI. */
  name: string
  family?: 'picto' | 'items'
  size?: number | string
}

const iconByName: Record<string, typeof Key01> = {
  'arrow-bottom': ChevronDown,
  'arrow-change': SwitchVertical01,
  'arrow-left': ArrowLeft,
  'arrow-next': ChevronRight,
  'arrow-prev': ChevronLeft,
  'arrow-right': ArrowRight,
  'arrow-top': ChevronUp,
  audio: Headphones01,
  bank: Bank,
  'bell-1': Bell01,
  binoculars: Telescope,
  block: SlashCircle01,
  'book-1': BookOpen01,
  brain: CpuChip01,
  brush: Brush01,
  'bubble-typing': MessageDotsSquare,
  bulb: Lightbulb02,
  'bullet-1': Dotpoints01,
  calendar: Calendar,
  'camera-1': Camera01,
  cards: CreditCard01,
  'category-1': Grid01,
  'category-2': LayersThree01,
  certify: CheckSquare,
  'certify-line': Circle,
  chart: BarChart03,
  clip: Paperclip,
  cloud: Cloud01,
  'coin-2': Coins01,
  color: Palette,
  'control-1': Sliders01,
  'coupon-1': Ticket01,
  'crown-1': Award01,
  dashboard: LayoutGrid01,
  date: CalendarDate,
  'delete-1': Trash01,
  download: Download01,
  earth: Translate01,
  energy: Zap,
  entrance: LogIn01,
  exit: LogOut01,
  export: ArrowUpRight,
  'eye-hide': EyeOff,
  'eye-show': Eye,
  filter: FilterLines,
  fire: ZapFast,
  'flask-1': Beaker01,
  friend: Users01,
  'gift-1': Gift01,
  globe: Globe01,
  'grade-down': TrendDown01,
  'grade-up': TrendUp01,
  hand: Hand,
  'hand-like': ThumbsUp,
  'home-1': Home03,
  home: Home03,
  hourglass: Hourglass01,
  hp: Heart,
  'key-1': Key01,
  'key-gold': Key01,
  'layer-1': Copy01,
  'layer-2': Database01,
  learn: GraduationHat01,
  'link-1': Link01,
  'link-2': LinkBroken01,
  mail: Mail01,
  'mark-check': Check,
  'mark-minus': Minus,
  'mark-plus': Plus,
  'mark-warning': AlertTriangle,
  'mark-x': XClose,
  megaphone: Announcement01,
  'menu-1': Menu01,
  'menu-2': DotsHorizontal,
  'message-1': MessageSquare01,
  'message-2': MessageChatCircle,
  mic: Microphone01,
  mix: Shuffle01,
  money: CurrencyDollar,
  'money-bag': Wallet01,
  monitor: TerminalSquare,
  moon: Moon01,
  move: DotsVertical,
  'music-on': MusicNote01,
  'news-1': File06,
  notice: FileQuestion01,
  'paper-1': File01,
  'paper-2': File02,
  'paper-3': FileCode01,
  pencil: Edit03,
  photo: Image01,
  pick: Cursor01,
  'player-play': Play,
  'player-skip-fw': ChevronRightDouble,
  'player-skip-rw': ChevronLeftDouble,
  quest: ClipboardCheck,
  quit: XClose,
  'ranking-1': SwitchVertical01,
  refresh: RefreshCw01,
  'road-sign': GitBranch01,
  rotate: RefreshCcw01,
  save: Save01,
  scan: Scan,
  scroll: Receipt,
  'scroll-1-stats': BarChart03,
  document: ClipboardCheck,
  gear: Settings02,
  search: SearchLg,
  send: Send01,
  'setting-1': Settings01,
  'setting-2': Settings04,
  'setting-3': Settings02,
  share: Share07,
  shield: Shield01,
  speed: Activity,
  sun: Sun,
  switch: Toggle03Left,
  'symbol-check': CheckCircle,
  'symbol-info': InfoCircle,
  'symbol-plus': PlusCircle,
  'symbol-question': HelpCircle,
  'symbol-warning': AlertCircle,
  'symbol-x': XCircle,
  tag: Tag01,
  'time-1': Clock,
  timer: Hourglass02,
  'tool-1': Tool01,
  'trophy-1': Trophy01,
  'user-1': User01,
  video: VideoRecorder,
  'wand-magic': MagicWand01,
  'wand-star': Stars01,
  wifi: Wifi,
  'wifi-off': WifiOff,
  'window-max': Maximize01,
  write: Edit05,
  zoomin: ZoomIn,
  'coin-gold-dollar': Coins01,
  'gem-blue': Diamond01,
  'gem-purple': Diamond01,
  'chest-gold': Package,
  lock: Lock01,
}

const artworkStyle: CSSProperties = { width: '100%', height: '100%' }

/** Retains the established icon API while replacing raster game sprites. */
export function GameIcon(props: GameIconProps) {
  const { name, family = 'picto', size = 24, children, ...svgProps } = props
  const Icon = iconByName[name] ?? LayersThree01
  const labelled = Boolean(
    props['aria-label'] || props['aria-labelledby'] || children
  )
  return (
    <svg
      aria-hidden={labelled ? undefined : true}
      role={labelled ? 'img' : undefined}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
      fill='none'
      strokeLinecap='round'
      strokeLinejoin='round'
      focusable='false'
      {...svgProps}
      className={cn('game-icon console-line-icon shrink-0', props.className)}
      data-game-icon={`${family}/${name}`}
    >
      {/* Untitled replaces children internally. The native outer SVG owns
          metadata, refs and events; the inner SVG is only decorative artwork. */}
      <Icon
        aria-hidden='true'
        focusable='false'
        width='100%'
        height='100%'
        stroke='inherit'
        strokeWidth='inherit'
        fill='inherit'
        strokeLinecap='inherit'
        strokeLinejoin='inherit'
        style={artworkStyle}
      />
      {children}
    </svg>
  )
}
