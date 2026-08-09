export async function calculateClientDebt(clientId) {
    const { saleModel } = await import('../../sales/infrastructure/SaleModel.js');
    const { paymentModel } = await import('../../payments/infrastructure/PaymentModel.js');
    const { getRefundsBySaleIds } = await import('../../sales/infrastructure/SaleFinancialStateService.js');

    const pendingSales = await saleModel.find({
        clienteId: clientId,
        estado: { $nin: ['ANULADA', 'Anulado'] },
        tipoVenta: { $in: ['Crédito', 'Credito', 'Mixto'] }
    });

    if (!pendingSales || pendingSales.length === 0) {
        return 0;
    }

    const saleIds = pendingSales.map(s => s._id);
    const [allPayments, refundsBySale] = await Promise.all([
        paymentModel.find({
            estado: { $ne: 'ANULADO' },
            ventaId: { $in: saleIds }
        }),
        getRefundsBySaleIds(saleIds),
    ]);

    const paymentsBySale = allPayments.reduce((acc, p) => {
        const saleIdStr = p.ventaId.toString();
        acc[saleIdStr] = (acc[saleIdStr] || 0) + p.monto;
        return acc;
    }, {});

    let totalDeuda = 0;

    pendingSales.forEach(sale => {
        if (sale.tipoVenta === 'Contado') return;
        
        const total = sale.total || 0;
        const abonos = paymentsBySale[sale._id.toString()] || 0;
        
        let pagoInicial = 0;
        if (sale.tipoVenta === 'Mixto') {
            pagoInicial = (sale.montoContado != null) ? sale.montoContado : ((sale.montoCredito != null && sale.montoCredito > 0) ? Math.max(0, total - sale.montoCredito) : 0);
        }

        const reembolsos = refundsBySale.get(String(sale._id)) || 0;
        const porPagarCalc = Math.max(0, total - pagoInicial - abonos - reembolsos);
        
        totalDeuda += porPagarCalc;
    });

    // Redondear para evitar errores de precisión de punto flotante (ej. 0.000000000000004)
    return Math.round(totalDeuda);
}
