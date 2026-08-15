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

export const modalOverlayClassName =
  'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs'

export const modalContentMotionClassName =
  'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100'

export const modalSurfaceClassName =
  'bg-popover text-popover-foreground rounded-2xl shadow-[0_1.5rem_4rem_-1.5rem_rgb(0_0_0/0.32)] ring-1 ring-black/8 dark:ring-white/10'

export const modalFooterClassName =
  'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'

export const modalAlertFooterClassName =
  'grid w-full grid-flow-col auto-cols-fr items-center gap-2 [&>*]:w-full'

export const modalDestructiveActionClassName =
  'bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90'
