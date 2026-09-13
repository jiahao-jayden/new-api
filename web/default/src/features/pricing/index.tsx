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
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { PageTransition } from '@/components/page-transition'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import {
  LoadingSkeleton,
  EmptyState,
  SearchBar,
  PricingSidebar,
  PricingToolbar,
  ModelCardGrid,
} from './components'
import { ModelSelectionPanel } from './components/model-selection-panel'
import { PricingLayout } from './components/pricing-layout'
import { EXCLUDED_GROUPS, FILTER_ALL } from './constants'
import { useFilters } from './hooks/use-filters'
import { usePricingData } from './hooks/use-pricing-data'

export function Pricing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const userRole = useAuthStore((state) => state.auth.user?.role)
  const isAdmin = Boolean(userRole && userRole >= ROLE.ADMIN)
  const inspectorRef = useRef<HTMLElement>(null)
  const hasPositionedInitialModel = useRef(false)

  const {
    models,
    vendors,
    groupRatio,
    usableGroup,
    endpointMap,
    isLoading,
    priceRate,
    usdExchangeRate,
  } = usePricingData()

  const {
    currentSearch,
    selectedModelName,
    detailTab,
    searchInput,
    sortBy,
    vendorFilter,
    groupFilter,
    quotaTypeFilter,
    endpointTypeFilter,
    tagFilter,
    tokenUnit,
    showRechargePrice,
    setSearchInput,
    setSortBy,
    setVendorFilter,
    setGroupFilter,
    setQuotaTypeFilter,
    setEndpointTypeFilter,
    setTagFilter,
    filteredModels,
    hasActiveFilters,
    activeFilterCount,
    availableTags,
    clearFilters,
    clearSearch,
  } = useFilters(models || [])

  useEffect(() => {
    if (isLoading || hasPositionedInitialModel.current) return
    if (
      !selectedModelName ||
      !window.matchMedia('(max-width: 899px)').matches
    ) {
      hasPositionedInitialModel.current = true
      return
    }

    const frame = requestAnimationFrame(() => {
      hasPositionedInitialModel.current = true
      inspectorRef.current?.scrollIntoView({
        block: 'start',
        behavior: 'instant',
      })
      inspectorRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [isLoading, selectedModelName])

  const handleModelClick = useCallback(
    async (modelName: string) => {
      await navigate({
        to: '/pricing',
        search: { ...currentSearch, selectedModel: modelName },
        replace: true,
        resetScroll: false,
      })
      if (window.matchMedia('(max-width: 899px)').matches) {
        requestAnimationFrame(() => {
          const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches
          inspectorRef.current?.scrollIntoView({
            block: 'start',
            behavior: reducedMotion ? 'instant' : 'smooth',
          })
          inspectorRef.current?.focus({ preventScroll: true })
        })
      }
    },
    [navigate, currentSearch]
  )

  const availableGroups = useMemo(
    () =>
      Object.keys(usableGroup || {}).filter(
        (g) => !EXCLUDED_GROUPS.includes(g)
      ),
    [usableGroup]
  )

  const inspectedModel = selectedModelName
    ? (models || []).find((model) => model.model_name === selectedModelName)
    : filteredModels[0]
  const rackTitle = vendorFilter === FILTER_ALL ? t('Model Rack') : vendorFilter

  const handleClearAll = useCallback(() => {
    clearFilters()
    clearSearch()
  }, [clearFilters, clearSearch])

  const renderPricingContent = () => {
    if (filteredModels.length === 0) {
      return (
        <EmptyState
          searchQuery={searchInput}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAll}
        />
      )
    }

    return (
      <ModelCardGrid
        models={filteredModels}
        onModelClick={handleModelClick}
        priceRate={priceRate}
        usdExchangeRate={usdExchangeRate}
        tokenUnit={tokenUnit}
        showRechargePrice={showRechargePrice}
        selectedGroup={groupFilter}
        selectedModelName={inspectedModel?.model_name}
      />
    )
  }

  if (isLoading) {
    return (
      <PricingLayout>
        <div className='pencil-pricing-page'>
          <LoadingSkeleton />
        </div>
      </PricingLayout>
    )
  }

  return (
    <PricingLayout>
      <div className='pencil-pricing'>
        <PageTransition className='pencil-pricing-page'>
          <div className='pencil-pricing-layout' data-view='card'>
            <PricingSidebar
              quotaTypeFilter={quotaTypeFilter}
              endpointTypeFilter={endpointTypeFilter}
              vendorFilter={vendorFilter}
              groupFilter={groupFilter}
              tagFilter={tagFilter}
              onQuotaTypeChange={setQuotaTypeFilter}
              onEndpointTypeChange={setEndpointTypeFilter}
              onVendorChange={setVendorFilter}
              onGroupChange={setGroupFilter}
              onTagChange={setTagFilter}
              vendors={vendors || []}
              groups={availableGroups}
              groupRatios={groupRatio}
              showGroupRatios={isAdmin}
              tags={availableTags}
              models={models || []}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              className='pencil-pricing-sidebar-desktop'
            />

            <main className='pencil-pricing-main'>
              <header className='pencil-pricing-header'>
                <h1 className='pencil-pricing-title'>
                  {rackTitle}
                  <span className='pencil-pricing-count'>
                    · {filteredModels.length}
                  </span>
                </h1>
                <SearchBar
                  value={searchInput}
                  onChange={setSearchInput}
                  onClear={clearSearch}
                  placeholder={t(
                    'Search model name, provider, endpoint, or tag...'
                  )}
                  className='pencil-pricing-search'
                />
              </header>
              <PricingToolbar
                filteredCount={filteredModels.length}
                totalCount={models?.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                quotaTypeFilter={quotaTypeFilter}
                endpointTypeFilter={endpointTypeFilter}
                vendorFilter={vendorFilter}
                groupFilter={groupFilter}
                tagFilter={tagFilter}
                onQuotaTypeChange={setQuotaTypeFilter}
                onEndpointTypeChange={setEndpointTypeFilter}
                onVendorChange={setVendorFilter}
                onGroupChange={setGroupFilter}
                onTagChange={setTagFilter}
                vendors={vendors || []}
                groups={availableGroups}
                groupRatios={groupRatio}
                showGroupRatios={isAdmin}
                tags={availableTags}
                models={models || []}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                onClearFilters={clearFilters}
              />

              {renderPricingContent()}
            </main>

            {inspectedModel && (
              <ModelSelectionPanel
                key={inspectedModel.model_name}
                panelRef={inspectorRef}
                model={inspectedModel}
                selectedGroup={groupFilter}
                priceRate={priceRate ?? 1}
                usdExchangeRate={usdExchangeRate ?? 1}
                tokenUnit={tokenUnit}
                showRechargePrice={showRechargePrice}
                activeTab={detailTab}
                onTabChange={(nextTab) => {
                  void navigate({
                    to: '/pricing',
                    search: {
                      ...currentSearch,
                      selectedModel: inspectedModel.model_name,
                      detailTab: nextTab,
                    },
                    replace: true,
                    resetScroll: false,
                  })
                }}
                endpointMap={
                  (endpointMap as Record<
                    string,
                    { path?: string; method?: string }
                  >) || {}
                }
              />
            )}
            {selectedModelName && !inspectedModel && (
              <aside
                id='pricing-model-inspector'
                className='pencil-model-inspector pencil-model-inspector-full'
                aria-label={t('Model details')}
              >
                <h2>{t('Model not found')}</h2>
                <p className='text-muted-foreground mt-2 text-xs'>
                  {t("The model you're looking for doesn't exist.")}
                </p>
              </aside>
            )}
          </div>
        </PageTransition>
      </div>
    </PricingLayout>
  )
}
