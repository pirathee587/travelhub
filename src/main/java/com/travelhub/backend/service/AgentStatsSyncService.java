package com.travelhub.backend.service;

import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentStatsSyncService {

    private static final Logger logger = LoggerFactory.getLogger(AgentStatsSyncService.class);
    private final AgentRepository agentRepository;

    /**
     * This scheduled job runs every day at midnight (00:00).
     * It recalculates the total trips, revenue, and average rating for all agents,
     * and saves these actual values into the agent table columns.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void syncAgentStats() {
        logger.info("Starting scheduled Agent stats synchronization...");
        List<Agent> agents = agentRepository.findAll();
        
        for (Agent agent : agents) {
            Long agentId = agent.getId();
            
            // Calculate stats using existing repository queries
            Double totalRevenue = agentRepository.getTotalRevenueByAgentId(agentId);
            Long totalTrips = agentRepository.getTotalTripsByAgentId(agentId);
            Double avgRating = agentRepository.getAvgRatingByAgentId(agentId);
            
            // Update the physical columns
            agent.setTotalRevenue(totalRevenue != null ? totalRevenue.intValue() : 0);
            agent.setTotalTrips(totalTrips != null ? totalTrips.intValue() : 0);
            agent.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
            
            agentRepository.save(agent);
        }
        
        logger.info("Agent stats synchronized successfully for {} agents.", agents.size());
    }
}
