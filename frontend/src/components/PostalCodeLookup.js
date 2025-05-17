// src/components/PostalCodeLookup.js
import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Search } from 'lucide-react';
import { apiClient } from '../utils/api';
import { useTranslation } from 'react-i18next';
/**

Component for looking up city data based on postal code
*/
const PostalCodeLookup = ({
    postalCode,
    onCityFound,
    disabled = false
}) => {
    const { t } = useTranslation('checkout');
    const [loading, setLoading] = useState(false);
    const [localPostalCode, setLocalPostalCode] = useState(postalCode || '');
    const [error, setError] = useState(null);

    // Update local state when prop changes
    useEffect(() => {
        if (postalCode !== localPostalCode) {
            setLocalPostalCode(postalCode || '');
        }
    }, [postalCode]);
    // Handle lookup
    const handleLookup = async (e) => {
        e?.preventDefault();
        if (!localPostalCode || localPostalCode.length < 4) {
            setError(t('delivery.postal_code_invalid'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.get(`/delivery/cities/${localPostalCode}`);

            if (response) {
                onCityFound({
                    city: response.name,
                    postalCode: response.postalCode,
                    zoneId: response.zoneId,
                    zone: response.zone || null,
                    freeThreshold: response.freeThreshold
                });
            } else {
                setError(t('delivery.postal_code_not_found'));

                // Still update the parent with the postal code
                onCityFound({
                    postalCode: localPostalCode,
                    city: '',
                    zoneId: null,
                    zone: null,
                    freeThreshold: 0
                });
            }
        } catch (err) {
            console.error('Error looking up postal code:', err);
            setError(t('delivery.postal_code_error'));

            // Still update the parent with the postal code
            onCityFound({
                postalCode: localPostalCode,
                city: '',
                zoneId: null,
                zone: null,
                freeThreshold: 0
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Form onSubmit={handleLookup}>
            <Form.Group className="mb-3">
                <Form.Label>{t('delivery.postal_code')}</Form.Label>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder={t('delivery.postal_code_placeholder')}
                        value={localPostalCode}
                        onChange={(e) => setLocalPostalCode(e.target.value)}
                        isInvalid={!!error}
                        disabled={disabled || loading}
                        maxLength={4}
                    />
                    <Button
                        variant="outline-secondary"
                        onClick={handleLookup}
                        disabled={disabled || loading || !localPostalCode}
                    >
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <Search size={18} />
                        )}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                        {error}
                    </Form.Control.Feedback>
                </InputGroup>
                <Form.Text className="text-muted">
                    {t('delivery.postal_code_help')}
                </Form.Text>
            </Form.Group>
        </Form>
    );
};
export default PostalCodeLookup;