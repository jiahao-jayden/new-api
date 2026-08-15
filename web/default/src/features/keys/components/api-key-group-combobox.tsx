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
import { Check, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ApiKeyGroupOption = {
  value: string
  label: string
  desc?: string
}

const GROUP_OPTION_TONE_CLASS_NAMES = [
  'bg-primary-container text-primary-container-foreground',
  'bg-secondary-container text-secondary-container-foreground',
  'bg-tertiary-container text-tertiary-container-foreground',
] as const

type ApiKeyGroupComboboxProps = {
  options: ApiKeyGroupOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ApiKeyGroupCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
}: ApiKeyGroupComboboxProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    if (!search) return options

    return options.filter(
      (option) =>
        option.value.toLowerCase().includes(search) ||
        option.label.toLowerCase().includes(search) ||
        option.desc?.toLowerCase().includes(search)
    )
  }, [options, searchValue])

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setOpen(false)
    setSearchValue('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='secondary'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className='bg-surface-container-lowest hover:bg-surface-container-high data-popup-open:bg-surface-container-lowest data-popup-open:ring-ring/25 h-14 w-full justify-between gap-3 rounded-2xl px-4 py-3 text-start shadow-none transition-[background-color,box-shadow] duration-200 data-popup-open:ring-3'
          />
        }
      >
        <span className='flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-3'>
          <span className='min-w-0'>
            <span className='block font-medium break-words whitespace-normal'>
              {selectedOption?.label || placeholder || t('Select a group')}
            </span>
            {selectedOption?.desc && (
              <span className='text-muted-foreground block text-[11px] break-words whitespace-normal sm:text-xs'>
                {selectedOption.desc}
              </span>
            )}
          </span>
        </span>
        <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
      </PopoverTrigger>
      <PopoverContent
        className='bg-surface-container-low data-closed:zoom-out-100 data-open:zoom-in-100 data-[side=bottom]:slide-in-from-top-0 data-[side=left]:slide-in-from-right-0 data-[side=right]:slide-in-from-left-0 data-[side=top]:slide-in-from-bottom-0 w-[var(--anchor-width)] overflow-hidden rounded-3xl p-2 shadow-none ring-0 data-closed:duration-150 data-closed:ease-[var(--motion-easing-emphasized)] data-open:duration-200 data-open:ease-[var(--motion-easing-emphasized)]'
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('Search...')}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className='max-h-[360px]'>
            <CommandEmpty>{t('No group found.')}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option, index) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className={cn(
                    'mb-1 items-start gap-3 rounded-2xl px-3 py-3 last:mb-0 data-[selected=true]:brightness-95',
                    GROUP_OPTION_TONE_CLASS_NAMES[
                      index % GROUP_OPTION_TONE_CLASS_NAMES.length
                    ]
                  )}
                >
                  <Check
                    className={cn(
                      'mt-0.5 size-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className='min-w-0 flex-1'>
                    <span className='block font-medium break-words whitespace-normal'>
                      {option.label}
                    </span>
                    {option.desc && (
                      <span className='block text-xs break-words whitespace-normal opacity-75'>
                        {option.desc}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
