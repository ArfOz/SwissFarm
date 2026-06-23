import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function handleSend() {
    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter a subject.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Required', 'Please enter your message.');
      return;
    }

    // For now, show a confirmation. In production, this would call an API.
    Alert.alert(
      'Message Sent',
      'Thank you for your message. We will get back to you as soon as possible.',
      [{ text: 'OK', onPress: () => { setSubject(''); setMessage(''); } }],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.headerIcon}>✉️</Text>
        <Text style={styles.title}>Contact</Text>
        <Text style={styles.subtitle}>
          Have a question or feedback? Send us a message and we'll get back to you.
        </Text>

        {/* Contact Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Suggestion, Question, Bug Report"
            placeholderTextColor={colors.textSecondary}
            value={subject}
            onChangeText={setSubject}
            returnKeyType="next"
          />

          <Text style={styles.cardTitle}>Your Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Write your message here..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send Message →</Text>
          </TouchableOpacity>
        </View>

        {/* Address only */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📍</Text>
          <Text style={styles.cardTitle}>Address</Text>
          <Text style={styles.cardValue}>
            SwissFarm AG{'\n'}
            Bahnhofstrasse 1{'\n'}
            8001 Zürich{'\n'}
            Switzerland
          </Text>
        </View>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} SwissFarm. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  headerIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  messageInput: {
    minHeight: 140,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sendButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});