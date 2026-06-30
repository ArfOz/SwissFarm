import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Platform, StatusBar } from 'react-native';
import { CATEGORY_NAMES, CATEGORY_LABELS } from '@swissfarm/types';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 44;
const CAT_BTN_WIDTH = 72;

interface MapHeaderProps {
  selectedCategory: string;
  showProductFilter: boolean;
  products: { id: string; name: string }[];
  productsLoading: boolean;
  selectedProductIds: Set<string>;
  filterLoading: boolean;
  onCategoryPress: (cat: string) => void;
  onToggleProduct: (productId: string) => void;
  onApplyFilter: () => void;
}

export function MapHeader({
  selectedCategory, showProductFilter, products, productsLoading,
  selectedProductIds, filterLoading,
  onCategoryPress, onToggleProduct, onApplyFilter,
}: MapHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT }]}>
      <View style={styles.headerTopRow}>
        <Text style={styles.headerTitle}>SwissFarm</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catBar}
        contentContainerStyle={styles.catBarContent}
      >
        {CATEGORY_NAMES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, selectedCategory === cat && styles.catBtnSelected]}
            onPress={() => onCategoryPress(cat)}
          >
            <Text style={[styles.catBtnLabel, selectedCategory === cat && styles.catBtnLabelSelected]}>
              {cat === 'all' ? '🏠' : CATEGORY_LABELS[cat]?.split(' ')[0]}
            </Text>
            <Text style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextSelected]}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory !== 'all' && showProductFilter && (
        <View style={styles.productChipsContainer}>
          {productsLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : products.length === 0 ? (
            <Text style={styles.noProductsText}>No products</Text>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {products.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.prodChip, selectedProductIds.has(p.id) && styles.prodChipSelected]}
                    onPress={() => onToggleProduct(p.id)}
                  >
                    <Text style={[styles.prodChipText, selectedProductIds.has(p.id) && styles.prodChipTextSelected]}>
                      {selectedProductIds.has(p.id) ? '☑' : '○'} {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.applyProdBtn} onPress={onApplyFilter} disabled={filterLoading}>
                {filterLoading ? (
                  <ActivityIndicator size="small" color="#2e7d32" />
                ) : (
                  <Text style={styles.applyProdBtnText}>
                    Apply {selectedProductIds.size > 0 ? `(${selectedProductIds.size})` : '(all)'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#2e7d32',
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  catBar: {
    maxHeight: 52,
  },
  catBarContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  catBtn: {
    width: CAT_BTN_WIDTH,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  catBtnSelected: {
    backgroundColor: '#fff',
  },
  catBtnLabel: {
    fontSize: 16,
  },
  catBtnLabelSelected: {},
  catBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  catBtnTextSelected: {
    color: '#2e7d32',
  },
  productChipsContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  noProductsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
  prodChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  prodChipSelected: {
    backgroundColor: '#fff',
  },
  prodChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  prodChipTextSelected: {
    color: '#2e7d32',
  },
  applyProdBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  applyProdBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2e7d32',
  },
});