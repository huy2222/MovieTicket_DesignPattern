package org.example.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DbFix implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbFix(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("=== SEARCHING FOR 'price' COLUMN IN DATABASE ===");
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.columns " +
                "WHERE table_schema = DATABASE() AND column_name = 'price'"
            );
            
            if (columns.isEmpty()) {
                System.out.println("No 'price' column found in any table!");
            } else {
                for (Map<String, Object> col : columns) {
                    String tableName = (String) col.get("TABLE_NAME");
                    System.out.println("Found 'price' column in table: " + tableName);
                    
                    // Drop it
                    if (!tableName.equalsIgnoreCase("combos") && !tableName.equalsIgnoreCase("showtimes")) {
                        try {
                            jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP COLUMN price");
                            System.out.println("-> DROPPED 'price' from " + tableName);
                        } catch (Exception ex) {
                            System.out.println("-> Failed to drop from " + tableName + ": " + ex.getMessage());
                        }
                    } else {
                        System.out.println("-> Skipping dropping 'price' from " + tableName + " (expected to have price).");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
