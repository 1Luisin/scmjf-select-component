"use client";

import {
  Children,
  createElement as h,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";

function getOptionText(children) {
  return Children.toArray(children)
    .map((child) => (typeof child === "string" || typeof child === "number" ? child : ""))
    .join("")
    .trim();
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildChangeEvent(name, value, option) {
  return {
    target: { name, value, option },
    currentTarget: { name, value, option }
  };
}

function normalizeOption(option) {
  const value = option?.value ?? option?.id ?? "";
  const label = option?.label ?? option?.name ?? option?.text ?? value;

  return {
    value: String(value ?? ""),
    label: String(label ?? ""),
    disabled: Boolean(option?.disabled),
    raw: option
  };
}

function optionsFromChildren(children) {
  return Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === "option")
    .map((child) => {
      const optionValue = child.props.value ?? getOptionText(child.props.children);

      return {
        value: String(optionValue ?? ""),
        label: getOptionText(child.props.children) || String(optionValue ?? ""),
        disabled: Boolean(child.props.disabled),
        raw: child.props
      };
    });
}

export default function ScmjfSelect({
  children,
  options: optionsProp,
  className = "",
  value = "",
  onChange,
  disabled = false,
  required = false,
  name,
  id,
  placeholder = "Selecione",
  searchPlaceholder = "Digite para buscar...",
  emptyMessage = "Nenhuma opcao encontrada",
  searchable = true,
  "aria-label": ariaLabel = "Selecionar opcao",
  ...props
}) {
  const generatedId = useId();
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const stringValue = String(value ?? "");
  const listId = `${id || generatedId}-listbox`;

  const options = useMemo(() => {
    if (Array.isArray(optionsProp)) return optionsProp.map(normalizeOption);
    return optionsFromChildren(children);
  }, [children, optionsProp]);

  const selectedOption = options.find((option) => option.value === stringValue);
  const isPlaceholder = !stringValue || !selectedOption;
  const displayLabel = selectedOption?.label || placeholder;
  const normalizedSearch = normalizeSearch(search);

  const filteredOptions = useMemo(() => {
    if (!searchable || !normalizedSearch) return options;

    return options.filter((option) => {
      const haystack = normalizeSearch(`${option.label} ${option.value}`);
      return haystack.includes(normalizedSearch);
    });
  }, [normalizedSearch, options, searchable]);

  useEffect(() => {
    if (!open) return undefined;

    const focusId = window.setTimeout(() => {
      if (!searchable) return;
      searchRef.current?.focus();
      searchRef.current?.setSelectionRange(search.length, search.length);
    }, 0);

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, search.length, searchable]);

  function emitChange(nextValue, option) {
    onChange?.(buildChangeEvent(name, nextValue, option));
  }

  function openSelect(initialSearch = "") {
    if (disabled) return;
    setSearch(searchable ? initialSearch : "");
    setOpen(true);
  }

  function selectOption(option) {
    if (option.disabled) return;

    emitChange(option.value, option.raw);
    setSearch("");
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event) {
    if (["ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openSelect("");
      return;
    }

    if (searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      openSelect(event.key);
    }
  }

  function handleInvalid(event) {
    event.preventDefault();
    openSelect("");
    triggerRef.current?.focus();
  }

  return h(
    "div",
    {
      className: ["scmjf-select", className].filter(Boolean).join(" "),
      ref: wrapperRef
    },
    h(
      "button",
      {
        ...props,
        id,
        ref: triggerRef,
        type: "button",
        className: "scmjf-select-trigger",
        "aria-label": ariaLabel,
        "aria-expanded": open,
        "aria-controls": open ? listId : undefined,
        "aria-haspopup": "listbox",
        disabled,
        onClick: () => (open ? setOpen(false) : openSelect("")),
        onKeyDown: handleTriggerKeyDown
      },
      h(
        "span",
        { className: isPlaceholder ? "scmjf-select-placeholder" : "scmjf-select-value" },
        displayLabel
      ),
      h(
        "svg",
        { className: "scmjf-select-arrow", viewBox: "0 0 24 24", "aria-hidden": "true" },
        h("path", { d: "m7 10 5 5 5-5H7Z" })
      )
    ),
    h("input", {
      className: "scmjf-select-required-field",
      tabIndex: -1,
      "aria-hidden": "true",
      required,
      value: stringValue,
      name,
      readOnly: true,
      onInvalid: handleInvalid,
      disabled
    }),
    open &&
      h(
        "div",
        { className: "scmjf-select-popover" },
        searchable &&
          h("input", {
            ref: searchRef,
            className: "scmjf-select-search",
            type: "text",
            value: search,
            onChange: (event) => setSearch(event.target.value),
            placeholder: searchPlaceholder,
            "aria-label": "Buscar opcao"
          }),
        h(
          "div",
          { className: "scmjf-select-options", role: "listbox", id: listId },
          filteredOptions.length === 0 &&
            h("div", { className: "scmjf-select-empty" }, emptyMessage),
          filteredOptions.map((option) => {
            const selected = option.value === stringValue;

            return h(
              "button",
              {
                key: `${option.value}-${option.label}`,
                type: "button",
                className: [
                  "scmjf-select-option",
                  selected ? "is-selected" : "",
                  option.disabled ? "is-disabled" : ""
                ]
                  .filter(Boolean)
                  .join(" "),
                role: "option",
                "aria-selected": selected,
                disabled: option.disabled,
                onClick: () => selectOption(option)
              },
              h("span", null, option.label),
              selected &&
                h(
                  "svg",
                  { viewBox: "0 0 24 24", "aria-hidden": "true" },
                  h("path", { d: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" })
                )
            );
          })
        )
      )
  );
}
