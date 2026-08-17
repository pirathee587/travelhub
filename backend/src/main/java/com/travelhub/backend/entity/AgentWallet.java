package com.travelhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_wallets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentWallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false, unique = true)
    private Agent agent;

    @Builder.Default
    @Column(name = "available_balance", nullable = false)
    private Double availableBalance = 0.0;

    @Builder.Default
    @Column(name = "pending_escrow_balance", nullable = false)
    private Double pendingEscrowBalance = 0.0;

    @Builder.Default
    @Column(name = "total_withdrawn", nullable = false)
    private Double totalWithdrawn = 0.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
