"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { PREDEFINED_TAGS } from "@/lib/admin/tags";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = PREDEFINED_TAGS.filter(
    (t) =>
      t.toLowerCase().includes(input.toLowerCase()) && !value.includes(t),
  );

  const showDropdown = open && (filtered.length > 0 || input.length > 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addTag(tag: string) {
    const normalized = tag.toLowerCase().trim().replace(/\s+/g, "-");
    if (normalized && !value.includes(normalized)) {
      onChange([...value, normalized]);
    }
    setInput("");
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="block text-sm font-medium text-n-300">Tags</label>
      <div
        className={cn(
          "flex flex-wrap gap-1.5 p-2 rounded-xl border border-n-700 bg-n-900 min-h-[42px] cursor-text",
          open && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-accent/10 text-accent text-xs font-medium px-2 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:text-accent/60"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? (placeholder ?? "Adicionar tags...") : ""}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-foreground placeholder:text-n-500 outline-none"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-n-700 bg-n-900 shadow-lg max-h-48 overflow-auto">
          {filtered.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm text-n-300 hover:bg-n-800 hover:text-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
          {input.length > 0 &&
            !(PREDEFINED_TAGS as readonly string[]).includes(input.toLowerCase().trim().replace(/\s+/g, "-")) &&
            !value.includes(input.toLowerCase().trim().replace(/\s+/g, "-")) && (
              <button
                type="button"
                onClick={() => addTag(input)}
                className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-n-800 transition-colors"
              >
                Criar &quot;{input.toLowerCase().trim().replace(/\s+/g, "-")}&quot;
              </button>
            )}
        </div>
      )}
    </div>
  );
}
