<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    /**
     * Scope a query to apply dynamic filters.
     *
     * @param Builder $query
     * @param array<string, mixed> $filters
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        foreach ($filters as $field => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            if (method_exists($this, 'scope' . ucfirst($field))) {
                $query->{$field}($value);
            } elseif (\Illuminate\Support\Facades\Schema::hasColumn($this->getTable(), $field)) {
                $query->where($field, $value);
            }
        }

        return $query;
    }
}
