"use client"

import { Listbox, Transition } from "@headlessui/react"
import { HttpTypes } from "@medusajs/types"
import { ChevronUpDown } from "@medusajs/icons"
import { forwardRef, Fragment, useEffect, useMemo, useRef, useState } from "react"
import { NativeSelectProps } from "@modules/common/components/native-select"

type CountrySelectProps = Omit<NativeSelectProps, "children"> & {
  region?: HttpTypes.StoreRegion
}

const CountrySelect = forwardRef<HTMLSelectElement, CountrySelectProps>(
  (
    {
      placeholder = "Country",
      region,
      defaultValue,
      value,
      onChange,
      name,
      required,
      ...props
    },
    ref
  ) => {
    const countryOptions = useMemo(() => {
      if (!region) return []
      return (
        region.countries?.map((c) => ({
          value: c.iso_2 ?? "",
          label: c.display_name ?? "",
        })) ?? []
      )
    }, [region])

    const isControlled = value !== undefined

    // For uncontrolled (add/edit address forms) — use internal state
    const [selectedUncontrolled, setSelectedUncontrolled] = useState<{
      value: string
      label: string
    } | null>(
      countryOptions.find((o) => o.value === defaultValue) ?? null
    )

    // Sync uncontrolled initial value when options load
    useEffect(() => {
      if (!isControlled && defaultValue) {
        const match = countryOptions.find((o) => o.value === defaultValue)
        if (match) setSelectedUncontrolled(match)
      }
    }, [defaultValue, countryOptions, isControlled])

    // For controlled (checkout shipping/billing) — derive from value prop
    const selectedControlled = useMemo(
      () => countryOptions.find((o) => o.value === value) ?? null,
      [value, countryOptions]
    )

    const selected = isControlled ? selectedControlled : selectedUncontrolled

    const handleChange = (opt: { value: string; label: string } | null) => {
      if (isControlled) {
        // Fire synthetic-like event for controlled forms
        if (onChange && opt) {
          const event = {
            target: { name, value: opt.value },
          } as React.ChangeEvent<HTMLSelectElement>
          onChange(event)
        }
      } else {
        setSelectedUncontrolled(opt)
      }
    }

    // Hidden native select keeps form data correct
    const hiddenRef = useRef<HTMLSelectElement>(null)

    useEffect(() => {
      if (ref && "current" in ref) {
        ;(ref as React.MutableRefObject<HTMLSelectElement | null>).current =
          hiddenRef.current
      }
    }, [ref])

    return (
      <div className="relative">
        {/* Hidden native select for form submission */}
        <select
          ref={hiddenRef}
          name={name}
          required={required}
          value={selected?.value ?? ""}
          onChange={() => {}}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        >
          <option value="" disabled />
          {countryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <Listbox value={selected} onChange={handleChange}>
          {({ open }) => (
            <>
              <Listbox.Button className="w-full flex items-center justify-between border border-gray-700 bg-gray-900 hover:bg-gray-800 rounded-md px-4 py-2.5 text-sm text-left transition-colors focus:outline-none focus:ring-1 focus:ring-[#ccff00] focus:border-[#ccff00]">
                <span className={selected ? "text-white" : "text-gray-500"}>
                  {selected ? selected.label : placeholder}
                </span>
                <ChevronUpDown className="text-gray-400 shrink-0" />
              </Listbox.Button>

              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Listbox.Options className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-gray-900 border border-gray-700 shadow-xl focus:outline-none text-sm">
                  {countryOptions.map((o) => (
                    <Listbox.Option
                      key={o.value}
                      value={o}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none px-4 py-2.5 transition-colors ${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        } ${selected ? "text-[#ccff00] font-medium" : ""}`
                      }
                    >
                      {o.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </>
          )}
        </Listbox>
      </div>
    )
  }
)

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
