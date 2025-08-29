"use client";

import { PopoverClose } from "@radix-ui/react-popover";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { useDebounce } from "@workspace/ui/hooks/use-debounce";
import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronsUpDown, Edit, LoaderIcon, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Props<T extends object> {
  title?: string;
  // value?: T | T[]; // single OR multiple
  valueKey: keyof T;
  multiple?: boolean;
  disabled?: boolean;
  size?: number;
  renderText: (value: T) => string;
  // onChange?: (value: T | T[]) => void;
  searchFn: (search: string, offset: number, size: number) => Promise<T[]>;
  // New props for creation and editing
  onCreateClick?: () => void;
  onEditClick?: (item: T) => void;
  showCreateButton?: boolean;
  showEditButton?: boolean;
}

type PropsMultiple<T extends object> = Props<T> & {
  value?: T[];
  multiple: true;
  onChange?: (value: T | T[]) => void;
};

type PropsSingle<T extends object> = Props<T> & {
  value?: T;
  multiple: false;
  onChange?: (value: T) => void;
};

const ComboBox2 = <T extends object>({
  title,
  value,
  valueKey,
  multiple = false,
  disabled = false,
  size = 25,
  renderText,
  onChange,
  searchFn,
  onCreateClick,
  onEditClick,
  showCreateButton = false,
  showEditButton = false,
}: PropsMultiple<T> | PropsSingle<T>) => {
  const [search, setSearch] = useState<string>("");
  const [options, setOptions] = useState<T[]>([]);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const debouncedsearch = useDebounce<string>(search, 500);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getOptions = useCallback(async () => {
    setIsLoading(true);
    const searchResult = await searchFn(debouncedsearch || "", 0, size);
    if (searchResult.length === 0 || searchResult.length < size) {
      setCanLoadMore(false);
    }
    setOptions(searchResult);
    setIsLoading(false);
  }, [debouncedsearch, searchFn, size]);

  const getMoreOptions = useCallback(async () => {
    setIsLoading(true);
    const searchResult = await searchFn(
      debouncedsearch || "",
      options.length,
      size,
    );
    if (searchResult.length === 0 || searchResult.length < size) {
      setCanLoadMore(false);
    }
    if (
      searchResult[searchResult.length - 1]?.[valueKey] ===
      options[options.length - 1]?.[valueKey]
    ) {
      setCanLoadMore(false);
      return;
    }
    setOptions([...options, ...searchResult]);
    setIsLoading(false);
  }, [debouncedsearch, searchFn, options, valueKey, size]);

  const handleSelect = useCallback(
    (option: T) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        const exists = current.some((v) => v[valueKey] === option[valueKey]);
        const newValue = exists
          ? current.filter((v) => v[valueKey] !== option[valueKey])
          : [...current, option];
        onChange?.(newValue as any);
      } else {
        onChange?.(option);
      }
    },
    [multiple, value, valueKey, onChange],
  );

  const handleCreateClick = useCallback(() => {
    onCreateClick?.();
  }, [onCreateClick]);

  const handleEditClick = useCallback(
    (item: T) => {
      onEditClick?.(item);
    },
    [onEditClick],
  );

  useEffect(() => {
    getOptions();
  }, [getOptions]);

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between",
            (!value || (Array.isArray(value) && value.length === 0)) &&
            "text-muted-foreground",
          )}
          disabled={disabled}
        >
          <div className="truncate">
            {multiple
              ? Array.isArray(value) && value.length > 0
                ? value.map(renderText).join(", ")
                : `${title}`
              : value
                ? renderText(value as T)
                : `${title}`}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="PopoverContent p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {/* Create button */}
              {showCreateButton && onCreateClick && (
                <PopoverClose asChild>
                  <CommandItem
                    onSelect={handleCreateClick}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create New
                  </CommandItem>
                </PopoverClose>
              )}

              {/* Options list */}
              <PopoverClose asChild>
                <div>
                  {options.map((option) => (
                    <CommandItem
                      value={String(option[valueKey])}
                      key={String(option[valueKey])}
                      onSelect={() => handleSelect(option)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            multiple
                              ? Array.isArray(value) &&
                                value.some(
                                  (v) => v[valueKey] === option[valueKey],
                                )
                                ? "opacity-100"
                                : "opacity-0"
                              : option[valueKey] === (value as T)?.[valueKey]
                                ? "opacity-100"
                                : "opacity-0",
                          )}
                        />
                        {renderText(option)}
                      </div>

                      {/* Edit button */}
                      {showEditButton && onEditClick && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(option);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </CommandItem>
                  ))}
                </div>
              </PopoverClose>

              {canLoadMore && (
                <CommandItem asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7"
                    onClick={getMoreOptions}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      "Load More ↓"
                    )}
                  </Button>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox2;
